import { AuditTrailRepository } from './auditTrail.repository';
import { AuditTrailService } from './auditTrail.service';

let auditTrailServiceInstance: AuditTrailService | null = null;

export function getAuditTrailService(): AuditTrailService {
  if (!auditTrailServiceInstance) {
    const repository = new AuditTrailRepository();
    auditTrailServiceInstance = new AuditTrailService(repository);
  }
  return auditTrailServiceInstance;
}

export { AuditTrailService } from './auditTrail.service';
export { AuditTrailRepository } from './auditTrail.repository';
