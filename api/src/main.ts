import cors from 'cors';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { omit } from 'lodash';
import { keyPairFromSeed } from 'ton-crypto';
import { PostInfo } from '../../web/src/shared/model';
import { PaymentChannel } from '../../web/src/shared/ton/payments/PaymentChannel';
import BN from 'bn.js';
import { Address, TonClient } from "ton";
import proxy from 'express-http-proxy';

const config = {
  mongoUrl: process.env.MONGO_URL!,
  serviceAddress: process.env.SERVICE_ADDRESS!,
  serviceSeed: process.env.SERVICE_SEED!,
  tonUrl: process.env.TON_URL!,
  tonKey: process.env.TON_KEY!,
};

async function run() {
  const app = express();

  const mongoClient = new MongoClient(config.mongoUrl);
  const tonClient = new TonClient({
    endpoint: config.tonUrl,
    apiKey: config.tonKey,
  });

  const serviceKeyPair = keyPairFromSeed(
    Buffer.from(config.serviceSeed, 'hex')
  );

  const channelCollection = mongoClient.db().collection('channels');
  const postCollection = mongoClient.db().collection('posts');

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

      const channel = {
        clientAddress,
        clientPublicKey,
        clientCurrentBalance: 0,
        clientSeqNo: 0,
        serviceAddress: config.serviceAddress,
        servicePublicKey: serviceKeyPair.publicKey.toString('hex'),
        serviceCurrentBalance: 0,
        serviceSeqNo: 0,
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

        const paymentChannel = PaymentChannel.create(tonClient, {
          isA: false,
          channelId: new BN(channel._id.toString()),
          myKeyPair: serviceKeyPair,
          hisPublicKey: Buffer.from(channel.clientPublicKey, 'hex'),
          addressA: Address.parse(channel.clientAddress),
          addressB: Address.parse(config.serviceAddress),
          initBalanceA: new BN(0),
          initBalanceB: new BN(0),
        });

        const channelState = await paymentChannel.getChannelState();

        if (channelState !== PaymentChannel.STATE_OPEN) {
          res
            .status(400)
            .json({ error: 'Channel is not open.'})
          return;
        }

        const paymentChannelData = await paymentChannel.getData();

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
        postCount,
        signature,
      } = req.body;

      // NOTE: Generate `postCount` posts
      const posts: PostInfo[] = [...new Array(postCount)].map(() => ({
        id: new ObjectId().toString(),
        title: 'Lorem Picsum',
        text: 'Lorem Picsum',
        imageUrl: 'https://picsum.photos/200',
        videoUrl: null,
      }));

      // TODO: Bill for `posts.length` posts.

      try {
        res.json(posts);
      } catch (error) {
        next(error);
      }
    },
  );

  await mongoClient.connect();

  app.listen(3200, () => {
    console.log('Server started listening on 3200 port.');
  });
}

run().catch(console.dir);
