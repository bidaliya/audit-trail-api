import mongoose, { Schema, Document } from 'mongoose';
import { AuditableEntity, AuditAction, AUDITABLE_ENTITIES, AUDIT_ACTIONS } from '@/shared/contracts';
import type { AuditValue } from './auditTrail.types';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  timestamp: Date;
  entity: AuditableEntity;
  entityId: string;
  action: AuditAction;
  actorId: string;
  requestId: string;
  diff: Array<{
    op: 'add' | 'remove' | 'replace';
    path: string;
    before?: AuditValue;
    after?: AuditValue;
  }>;
  fieldsChanged: string[];
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    entity: {
      type: String,
      enum: Object.values(AUDITABLE_ENTITIES),
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },
    actorId: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
    },
    diff: {
      type: [{
        op: { type: String, enum: ['add', 'remove', 'replace'], required: true },
        path: { type: String, required: true },
        before: Schema.Types.Mixed,
        after: Schema.Types.Mixed,
      }],
      required: true,
    },
    fieldsChanged: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  }
);

// Performance indexes for common queries
auditLogSchema.index({ timestamp: -1, _id: -1 }); // Primary sort + cursor
auditLogSchema.index({ entity: 1, entityId: 1 }); // Entity lookups
auditLogSchema.index({ actorId: 1 }); // Actor activity
auditLogSchema.index({ requestId: 1 }); // Request tracing
auditLogSchema.index({ action: 1 }); // Action filtering
auditLogSchema.index({ fieldsChanged: 1 }); // Field change queries (multikey)

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
