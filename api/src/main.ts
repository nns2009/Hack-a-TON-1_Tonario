import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { MongoClient, ObjectId, WithId } from 'mongodb';
import { omit } from 'lodash';
import { keyPairFromSeed } from 'ton-crypto';
import { PostInfo } from '../../web/src/shared/model';
import { PaymentChannel } from '../../web/src/shared/ton/payments/PaymentChannel';
import PRICES from '../../web/src/shared/PRICES'
import { hexToBuffer } from '../../web/src/shared/ton/utils'
import BN from 'bn.js';
import {Address, toNano, TonClient} from "ton";
import proxy from 'express-http-proxy';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

const config = {
  port: process.env.PORT,
  publicUrl: process.env.PUBLIC_URL!,

  mongoUrl: process.env.MONGO_URL!,

  serviceAddress: process.env.SERVICE_ADDRESS!,
  serviceSeed: process.env.SERVICE_SEED!,

  tonUrl: process.env.TON_URL!,
  tonKey: process.env.TON_KEY!,

  s3: {
    endpoint: process.env.AWS_ENDPOINT!,
    keyId: process.env.AWS_ACCESS_KEY_ID!,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: process.env.AWS_S3_BUCKET!,
  },
};

interface Channel {
  clientAddress: string;
  clientPublicKey: string;
  clientCurrentBalance: string;
  clientSeqNo: string;
  serviceAddress: string;
  servicePublicKey: string
  serviceCurrentBalance: string;
  serviceSeqNo: string;
  initialized: boolean;
}

interface Post {
  title: string;
  text: string;
  imageId: string | null;
  videoId: string | null;
  createdAt: string;
}

async function run() {
  const app = express();

  const mongoClient = new MongoClient(config.mongoUrl);
  const tonClient = new TonClient({
    endpoint: config.tonUrl,
    apiKey: config.tonKey,
  });

  const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(config.s3.endpoint),
    accessKeyId: config.s3.keyId,
    secretAccessKey: config.s3.secretKey,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  const upload = multer({
    storage: multerS3({
      s3,
      bucket: config.s3.bucket,
      key(request: Request, file, callback) {
        const fileId = uuidv4();
        callback(null, `images/${fileId}`);
      },
    }),
  });

  const serviceKeyPair = keyPairFromSeed(
    Buffer.from(config.serviceSeed, 'hex')
  );

  const channelCollection = mongoClient.db().collection<Channel>('channels');
  const postCollection = mongoClient.db().collection<Post>('posts');

  app.use(cors());
  app.use(express.json());

  const jsonRpcUrl = new URL(config.tonUrl);

  app.use(
    '/jsonRPC',
    proxy(jsonRpcUrl.host, {
      https: jsonRpcUrl.protocol.startsWith('https'),
      proxyReqPathResolver: () => jsonRpcUrl.pathname,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers!['X-API-Key'] = config.tonKey;
        return proxyReqOpts;
      },
    }),
  );

  app.post(
    '/create-channel',
    async (req, res, next) => {
      const {
        clientAddress,
        clientPublicKey,
      } = req.body;

      const channel: Channel = {
        clientAddress,
        clientPublicKey,
        clientCurrentBalance: new BN(0).toString(10),
        clientSeqNo: new BN(0).toString(10),
        serviceAddress: config.serviceAddress,
        servicePublicKey: serviceKeyPair.publicKey.toString('hex'),
        serviceCurrentBalance: new BN(0).toString(10),
        serviceSeqNo: new BN(0).toString(10),
        initialized: false,
      };

      const { insertedId: channelId } = await channelCollection.insertOne(channel);

      try {
        res.json({
          channelId,
          ...omit(channel, '_id'),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.post(
    '/init-channel',
    async (req, res, next) => {
      const { channelId } = req.body;

      try {
        const channel = await channelCollection.findOne({
          _id: new ObjectId(channelId),
        });

        if (!channel) {
          res
            .status(404)
            .json({ error: 'Channel does not exist.' });
          return;
        }

        if (channel.initialized) {
          res
            .status(404)
            .json({ error: 'Channel is already initialized.' });
          return;
        }

        const paymentChannel = PaymentChannel.create({
          isA: false,
          channelId: new BN(channel._id.toString(), 'hex'),
          myKeyPair: serviceKeyPair,
          hisPublicKey: Buffer.from(channel.clientPublicKey, 'hex'),
          addressA: Address.parse(channel.clientAddress),
          addressB: Address.parse(config.serviceAddress),
          initBalanceA: new BN(0),
          initBalanceB: new BN(0),
        });

        const channelState = await paymentChannel.getChannelState(tonClient);

        if (channelState !== PaymentChannel.STATE_OPEN) {
          res
            .status(400)
            .json({ error: 'Channel is not open.' })
          return;
        }

        const paymentChannelData = await paymentChannel.getData(tonClient);

        await channelCollection.updateOne({
          _id: new ObjectId(channelId),
        }, {
          $set: {
            initialized: true,
            clientCurrentBalance: paymentChannelData.balanceA.toString(10),
          },
        });

        res.json({ success: true })
      } catch (error) {
        next(error);
      }
    },
  );

  app.post(
    '/request-content',
    async (req, res, next) => {
      const {
        channelId,
        postCount,
        newChannelState,
        signature,
        cursor,
      } = req.body;

      try {
        const channel = await channelCollection.findOne({
          _id: new ObjectId(channelId),
        });

        if (!channel) {
          return res
            .status(400)
            .json({ error: 'Channel does not exist.' });
        }

        const channelState = {
            balanceA: new BN(channel.clientCurrentBalance, 10), balanceB: new BN(channel.serviceCurrentBalance, 10),
            seqnoA: new BN(channel.clientSeqNo, 10), seqnoB: new BN(channel.serviceSeqNo, 10)
          }
        const paymentChannel = PaymentChannel.create({
          isA: false,
          channelId: new BN(channel._id.toString(), 'hex'),
          myKeyPair: serviceKeyPair,
          hisPublicKey: Buffer.from(channel.clientPublicKey, 'hex'),
          addressA: Address.parse(channel.clientAddress),
          addressB: Address.parse(config.serviceAddress),
          initBalanceA: toNano(0.1),
          initBalanceB: new BN(0),
          state: channelState
        });

        const _newChannelState = JSON.parse(newChannelState)
        Object.keys(_newChannelState).map((key) => {
          _newChannelState[key] = new BN(_newChannelState[key], 16)
        })

        if (!(await paymentChannel.verifyState(_newChannelState, hexToBuffer(signature)))) {
          return res
            .status(400)
            .json({ error: 'Invalid signature' });
        }

        if (!_newChannelState.balanceB.gte(channelState.balanceB.add(PRICES.VIEW.mul(new BN(postCount))))) {
          return res
            .status(400)
            .json({ error: 'Invalid balance' });
        }

        const posts = await postCollection
          .find(
            {},
            { limit: postCount },
          )
          .toArray();

        await channelCollection.updateOne({
          _id: new ObjectId(channelId),
        }, {
          $set: {
            clientCurrentBalance: _newChannelState.balanceA.toString(10),
            serviceCurrentBalance: _newChannelState.balanceB.toString(10),
            clientSeqNo: _newChannelState.seqnoA.toString(10),
            serviceSeqNo: _newChannelState.seqnoB.toString(10),
          },
        });

        res.json({
          posts: posts.map((post: WithId<Post>): PostInfo => ({
            id: post._id.toString(),
            title: post.title,
            text: post.text,
            imageUrl: post.imageId && `${config.publicUrl}/images/${post.imageId}`,
            videoUrl: null,
            createdAt: post.createdAt,
          })),
          next: new ObjectId().toString(),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.post(
    '/create-post',
    upload.single('image'),
    async (req, res, next) => {
      const { title, text } = req.body;

      try {
        const { key: imageKey } = req.file as any;
        const imageId = imageKey.replace(/^images\//, '');

        const post: Post = {
          title,
          text,
          imageId,
          videoId: null,
          createdAt: new Date().toISOString(),
        };

        const { insertedId: postId } = await postCollection.insertOne(post);

        res.json({
          id: postId,
          ...omit(post, '_id'),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    '/images/:imageId',
    async (req, res, next) => {
      const { imageId } = req.params;

      try {
        const image = await s3
          .getObject({
            Bucket: config.s3.bucket,
            Key: `images/${imageId}`,
          })
          .promise();

        res.end(image.Body);
      } catch (error) {
        if ((error as any).code === 'NoSuchKey') {
          return res
            .status(404)
            .json({ error: 'Image does not exist.' });
        }

        next(error);
      }
    },
  );

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unexpected error:', err);
    res
      .status(500)
      .json({ error: 'Unexpected error.' });
  });

  await mongoClient.connect();

  const port = config.port ? parseInt(config.port, 10) : 3200;

  app.listen(port, () => {
    console.log(`Server started listening on ${port} port.`);
  });
}

run().catch(console.dir);
