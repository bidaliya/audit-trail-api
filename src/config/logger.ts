import pino from 'pino';
import { env } from './env';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function createTransport() {
  if (env.NODE_ENV === 'development') {
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  }

  // Production transports based on LOG_SINK
  switch (env.LOG_SINK) {
    case 'elastic':
      // In production, you'd configure Elasticsearch transport
      // For now, we log to file as fallback
      return {
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'app.log') },
      };

    case 'logtail':
      // In production, you'd configure Logtail transport
      // For now, we log to file as fallback
      return {
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'app.log') },
      };

    case 'file':
    default:
      return {
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'app.log') },
      };
  }
}

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: createTransport(),
  base: {
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
