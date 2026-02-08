import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AuthUser, TokenPayload } from './auth.types';
import { UnauthorizedError } from '@/shared/errors/AppError';
import { authConfig } from '@/config/auth';
import { logger } from '@/config/logger';

export class AuthService {
  constructor(private repository: AuthRepository) {}

  async login(name: string, credential: string): Promise<{ token: string; user: AuthUser }> {
    const user = await this.repository.findByName(name);
    
    if (!user) {
      logger.warn({ name }, 'Login attempt with non-existent user');
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidCredential = await bcrypt.compare(credential, user.credentials);
    
    if (!isValidCredential) {
      logger.warn({ userId: user._id }, 'Login attempt with invalid credentials');
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });

    logger.info({ userId: user._id, role: user.role }, 'User logged in successfully');

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      },
    };
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, authConfig.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
