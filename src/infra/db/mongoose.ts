import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

// Cached connection for serverless environments (Vercel)
let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    logger.info('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const options = {
      bufferCommands: false, // Disable buffering in serverless
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    };

    const connection = await mongoose.connect(env.MONGODB_ATLAS_URI, options);
    
    cachedConnection = connection;
    
    logger.info('Connected to MongoDB Atlas');
    
    return connection;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.disconnect();
    cachedConnection = null;
    logger.info('Disconnected from MongoDB');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
