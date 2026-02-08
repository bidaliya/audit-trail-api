import { env } from './env';

export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptRounds: 10,
} as const;
