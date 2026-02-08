import type { Types } from 'mongoose';
import type { AuditableEntity, AuditAction } from '@/shared/contracts';

export type AuditValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Types.ObjectId
  | AuditValue[]
  | { [key: string]: AuditValue };

export type AuditEntitySnapshot = Record<string, AuditValue>;

export type AuditDiffEntry = {
  op: 'add' | 'remove' | 'replace';
  path: string;
  before?: AuditValue;
  after?: AuditValue;
};

export interface CreateAuditLogData {
  entity: AuditableEntity;
  entityId: string;
  action: AuditAction;
  actorId: string;
  requestId: string;
  diff: AuditDiffEntry[];
  fieldsChanged: string[];
}

export interface AuditQueryFilters {
  from?: string;
  to?: string;
  entity?: AuditableEntity;
  entityId?: string;
  actorId?: string;
  actorIds?: string[];
  actorName?: string;
  action?: AuditAction;
  fieldsChanged?: string[];
  requestId?: string;
}
