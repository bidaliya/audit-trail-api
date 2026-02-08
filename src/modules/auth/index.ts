import { Router } from 'express';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { createAuthRoutes } from './auth.routes';

export function createAuthModule(): { router: Router; authMiddleware: AuthMiddleware } {
  const repository = new AuthRepository();
  const service = new AuthService(repository);
  const controller = new AuthController(service);
  const authMiddleware = new AuthMiddleware(service);
  const router = createAuthRoutes(controller);

  return { router, authMiddleware };
}

export { AuthMiddleware } from './auth.middleware';
export { AuthRepository } from './auth.repository';
