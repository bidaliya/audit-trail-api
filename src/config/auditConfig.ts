import { AUDITABLE_ENTITIES, AuditableEntity } from '@/shared/contracts';

export interface AuditEntityConfig {
  track: boolean;
  exclude: string[];
  redact: string[];
}

export const auditConfig: Record<AuditableEntity, AuditEntityConfig> = {
  [AUDITABLE_ENTITIES.BOOK]: {
    track: true,
    exclude: ['updatedAt'], // These fields won't appear in diff at all
    redact: [], // These fields will show as [REDACTED] in diff
  },
  [AUDITABLE_ENTITIES.USER]: {
    track: true,
    exclude: ['credentials'], // Don't even include in diff
    redact: ['credentials'], // Show as [REDACTED] if somehow included
  },
} as const;

export function shouldAudit(entity: AuditableEntity): boolean {
  return auditConfig[entity]?.track ?? false;
}

export function getExcludedFields(entity: AuditableEntity): string[] {
  return auditConfig[entity]?.exclude ?? [];
}

export function getRedactedFields(entity: AuditableEntity): string[] {
  return auditConfig[entity]?.redact ?? [];
}
