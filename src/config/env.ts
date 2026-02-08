import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  MONGODB_ATLAS_URI: process.env.MONGODB_ATLAS_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_SINK: (process.env.LOG_SINK as 'file' | 'elastic' | 'logtail') || 'file',
  ELASTIC_URL: process.env.ELASTIC_URL,
  LOGTAIL_TOKEN: process.env.LOGTAIL_TOKEN,
} as const;

// Validation
if (!env.MONGODB_ATLAS_URI) {
  throw new Error('MONGODB_ATLAS_URI environment variable is required');
}

if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'default-secret-change-in-production') {
  throw new Error('JWT_SECRET must be set in production');
}
