import { Router } from 'express';
import { AuditTrailRepository } from '@/modules/auditTrail/auditTrail.repository';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { createAuditsRoutes } from './audits.routes';
import { AuthMiddleware } from '@/modules/auth';

export function createAuditsModule(authMiddleware: AuthMiddleware): Router {
  const repository = new AuditTrailRepository();
  const service = new AuditsService(repository);
  const controller = new AuditsController(service);
  const router = createAuditsRoutes(controller, authMiddleware);

  return router;
}
