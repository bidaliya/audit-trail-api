import type { Document } from 'mongoose';
import type { IAuditLog } from '@/modules/auditTrail/auditLog.model';
import type { UserRole } from '@/shared/contracts';

export type UserSummary = {
  id: string;
  name: string;
  role: UserRole;
};

export type AuditLogBase = Omit<IAuditLog, keyof Document> & {
  _id: IAuditLog['_id'];
};

export type AuditLogResponse = AuditLogBase & {
  actor?: UserSummary;
  relatedUsers?: Record<string, UserSummary>;
};
