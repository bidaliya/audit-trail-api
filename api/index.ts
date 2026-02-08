import { createApp } from '../src/bootstrap/app';
import { connectToDatabase } from '../src/infra/db/mongoose';

const app = createApp();

// Ensure DB connection on cold start
let dbConnected = false;

export default async function handler(req: any, res: any) {
  if (!dbConnected) {
    await connectToDatabase();
    dbConnected = true;
  }
  
  return app(req, res);
}
