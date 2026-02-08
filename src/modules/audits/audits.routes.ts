import { Router } from 'express';
import { AuditsController } from './audits.controller';
import { AuthMiddleware } from '@/modules/auth';
import { USER_ROLES } from '@/shared/contracts';

export function createAuditsRoutes(
  controller: AuditsController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  // All audit routes require authentication AND admin role
  router.use(authMiddleware.authenticate);
  router.use(authMiddleware.requireRole([USER_ROLES.ADMIN]));

  router.get(
    '/',
    controller.getAudits
  );

  router.get('/:id', controller.getAudit);

  return router;
}
