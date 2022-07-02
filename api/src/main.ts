import cors from 'cors';
import express from 'express';

async function run() {
  const app = express();

  app.use(cors());

  app.listen(3200, () => {
    console.log('Server started listening on 3200 port.');
  });
}

run().catch(console.dir);
