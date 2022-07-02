import cors from 'cors';
import express from 'express';
import { MongoClient, ObjectId } from "mongodb";
import { omit } from "lodash";

async function run() {
  const app = express();
  const mongoClient = new MongoClient(process.env.MONGO_URL!);

  const channelCollection = mongoClient.db().collection('channels');
  const postCollection = mongoClient.db().collection('posts');

  app.use(cors());
  app.use(express.json());

  app.post(
    '/create-channel',
    async (req, res, next) => {
      const {
        clientAddress,
        clientPublicKey,
        clientInitialBalance,
      } = req.body;

      const channel = {
        clientAddress,
        clientPublicKey,
        clientInitialBalance,
        clientCurrentBalance: 1000000000,
        clientSeqNo: 0,
        serviceAddress: '',
        servicePublicKey: '',
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

        // TODO: Check if it's initialized.

        await channelCollection.updateOne({
          _id: new ObjectId(channelId),
        }, {
          $set: {
            initialized: true,
          },
        });

        res.json({ success: true, channel })
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
      const posts = [...new Array(postCount)].map(() => ({
          id: new ObjectId().toString(),
          title: 'Lorem Picsum',
          imageUrl: 'https://picsum.photos/200'
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
