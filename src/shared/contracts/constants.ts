export const USER_ROLES = {
  ADMIN: 'admin',
  REVIEWER: 'reviewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export const AUDITABLE_ENTITIES = {
  BOOK: 'Book',
  USER: 'User',
} as const;

export type AuditableEntity = typeof AUDITABLE_ENTITIES[keyof typeof AUDITABLE_ENTITIES];
