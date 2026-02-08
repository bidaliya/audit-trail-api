import { AuditableEntity } from '@/shared/contracts';
import { getExcludedFields, getRedactedFields } from '@/config/auditConfig';
import type { AuditValue, AuditEntitySnapshot, AuditDiffEntry } from './auditTrail.types';
import { isValidObjectId } from 'mongoose';
import type { Types } from 'mongoose';

const REDACTED_VALUE = '[REDACTED]';

function isObjectId(value: AuditValue): value is Types.ObjectId {
  return typeof value === 'object' && value !== null && isValidObjectId(value);
}

export function sanitizeValue(value: AuditValue, field: string, entity: AuditableEntity): AuditValue {
  const redactedFields = getRedactedFields(entity);

  if (redactedFields.includes(field)) {
    return REDACTED_VALUE;
  }

  if (isObjectId(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, field, entity));
  }

  // Handle nested objects
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sanitized: AuditEntitySnapshot = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val as AuditValue, key, entity);
    }
    return sanitized;
  }

  return value;
}

export function computeDiff(before: AuditEntitySnapshot | null, after: AuditEntitySnapshot | null, entity: AuditableEntity): AuditDiffEntry[] {
  const excludedFields = getExcludedFields(entity);
  const diff: AuditDiffEntry[] = [];

  // Filter out excluded fields
  const filterFields = (obj: AuditEntitySnapshot | null): AuditEntitySnapshot => {
    if (!obj) return {};
    const filtered: AuditEntitySnapshot = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!excludedFields.includes(key) && key !== '_id' && key !== '__v') {
        filtered[key] = value as AuditValue;
      }
    }
    return filtered;
  };

  const beforeFiltered = filterFields(before);
  const afterFiltered = filterFields(after);

  const allKeys = new Set([...Object.keys(beforeFiltered), ...Object.keys(afterFiltered)]);

  for (const key of allKeys) {
    const beforeValue = beforeFiltered[key];
    const afterValue = afterFiltered[key];

    const beforeExists = key in beforeFiltered;
    const afterExists = key in afterFiltered;

    if (!beforeExists && afterExists) {
      // Field added
      diff.push({
        op: 'add',
        path: `/${key}`,
        after: sanitizeValue(afterValue, key, entity),
      });
    } else if (beforeExists && !afterExists) {
      // Field removed
      diff.push({
        op: 'remove',
        path: `/${key}`,
        before: sanitizeValue(beforeValue, key, entity),
      });
    } else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      // Field replaced
      diff.push({
        op: 'replace',
        path: `/${key}`,
        before: sanitizeValue(beforeValue, key, entity),
        after: sanitizeValue(afterValue, key, entity),
      });
    }
  }

  return diff;
}

export function extractFieldsChanged(diff: AuditDiffEntry[]): string[] {
  return diff.map((op) => op.path.substring(1)); // Remove leading '/'
}
