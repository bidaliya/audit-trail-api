import { z } from 'zod';
import { AUDIT_ACTIONS, AUDITABLE_ENTITIES, USER_ROLES } from '../constants';

type AuditPrimitive = string | number | boolean | null;

type AuditObject = {
  [key: string]: AuditValue;
};

type AuditValue = AuditPrimitive | AuditValue[] | AuditObject;

const auditValueSchema: z.ZodType<AuditValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(auditValueSchema),
    z.record(auditValueSchema),
  ])
);

export const auditDiffOpSchema = z.object({
  op: z.enum(['add', 'remove', 'replace']),
  path: z.string(),
  before: auditValueSchema.optional(),
  after: auditValueSchema.optional(),
});

export const auditUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.REVIEWER]),
});

export const auditLogSchema = z.object({
  _id: z.string(),
  timestamp: z.string(),
  entity: z.enum([AUDITABLE_ENTITIES.BOOK, AUDITABLE_ENTITIES.USER]),
  entityId: z.string(),
  action: z.enum([AUDIT_ACTIONS.CREATE, AUDIT_ACTIONS.UPDATE, AUDIT_ACTIONS.DELETE]),
  actorId: z.string(),
  actor: auditUserSchema.optional(),
  requestId: z.string(),
  diff: z.array(auditDiffOpSchema),
  fieldsChanged: z.array(z.string()),
  relatedUsers: z.record(auditUserSchema).optional(),
});

export const auditQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  entity: z.enum([AUDITABLE_ENTITIES.BOOK, AUDITABLE_ENTITIES.USER]).optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  action: z.enum([AUDIT_ACTIONS.CREATE, AUDIT_ACTIONS.UPDATE, AUDIT_ACTIONS.DELETE]).optional(),
  fieldsChanged: z.string().optional(),
  requestId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

export const auditsResponseSchema = z.object({
  items: z.array(auditLogSchema),
  nextCursor: z.string().optional(),
});

export type AuditDiffOp = z.infer<typeof auditDiffOpSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditUser = z.infer<typeof auditUserSchema>;
export type AuditQuery = z.infer<typeof auditQuerySchema>;
export type AuditsResponse = z.infer<typeof auditsResponseSchema>;
