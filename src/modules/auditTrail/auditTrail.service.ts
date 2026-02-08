import { AuditTrailRepository } from './auditTrail.repository';
import { AuditableEntity, AuditAction } from '@/shared/contracts';
import { shouldAudit } from '@/config/auditConfig';
import { computeDiff, extractFieldsChanged } from './auditDiff';
import { getRequestId, getUserId } from '@/infra/requestContext/context';
import { logger } from '@/config/logger';
import { IAuditLog } from './auditLog.model';
import type { AuditEntitySnapshot, CreateAuditLogData } from './auditTrail.types';

export class AuditTrailService {
  constructor(private repository: AuditTrailRepository) {}

  async recordAudit(
    entity: AuditableEntity,
    entityId: string,
    action: AuditAction,
    before: AuditEntitySnapshot | null,
    after: AuditEntitySnapshot | null
  ): Promise<void> {
    // Check if this entity should be audited
    if (!shouldAudit(entity)) {
      logger.debug({ entity }, 'Skipping audit - tracking disabled');
      return;
    }

    const actorId = getUserId();
    if (!actorId) {
      logger.warn({ entity, entityId, action }, 'Cannot create audit log - no actorId in context');
      return;
    }

    const requestId = getRequestId();

    // Compute diff
    const diff = computeDiff(before, after, entity);
    const fieldsChanged = extractFieldsChanged(diff);

    const auditData: CreateAuditLogData = {
      entity,
      entityId,
      action,
      actorId,
      requestId,
      diff,
      fieldsChanged,
    };

    await this.repository.create(auditData);
    
    logger.info({
      entity,
      entityId,
      action,
      actorId,
      requestId,
      fieldsChanged,
    }, 'Audit log created');
  }

  async getAuditById(id: string): Promise<IAuditLog | null> {
    return this.repository.findById(id);
  }
}
