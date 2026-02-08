import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authRateLimiter } from '@/infra/security/rateLimit';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post(
    '/login',
    authRateLimiter,
    controller.login
  );

  return router;
}
