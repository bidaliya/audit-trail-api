import { Express } from 'express';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { connectToDatabase } from '@/infra/db/mongoose';

export async function startServer(app: Express): Promise<void> {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info({
        port: env.PORT,
        env: env.NODE_ENV,
      }, 'Server started successfully');
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}
