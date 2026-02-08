import { AuditLogModel, IAuditLog } from './auditLog.model';
import { decodeCursor } from '@/shared/http/pagination';
import mongoose from 'mongoose';
import type { FilterQuery } from 'mongoose';
import type { AuditQueryFilters, CreateAuditLogData } from './auditTrail.types';

export class AuditTrailRepository {
  async create(data: CreateAuditLogData): Promise<IAuditLog> {
    const auditLog = new AuditLogModel(data);
    return auditLog.save();
  }

  async findById(id: string): Promise<IAuditLog | null> {
    return AuditLogModel.findById(id).exec();
  }

  async findWithFilters(
    filters: AuditQueryFilters,
    limit: number,
    cursor?: string
  ): Promise<IAuditLog[]> {
    const query: FilterQuery<IAuditLog> = {};

    // Apply filters
    if (filters.from || filters.to) {
      query.timestamp = {};
      if (filters.from) {
        query.timestamp.$gte = new Date(filters.from);
      }
      if (filters.to) {
        query.timestamp.$lte = new Date(filters.to);
      }
    }

    if (filters.entity) {
      query.entity = filters.entity;
    }

    if (filters.entityId) {
      query.entityId = filters.entityId;
    }

    if (filters.actorId) {
      query.actorId = filters.actorId;
    } else if (filters.actorIds && filters.actorIds.length > 0) {
      query.actorId = { $in: filters.actorIds };
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.fieldsChanged && filters.fieldsChanged.length > 0) {
      query.fieldsChanged = { $in: filters.fieldsChanged };
    }

    if (filters.requestId) {
      query.requestId = filters.requestId;
    }

    // Apply cursor pagination
    if (cursor) {
      const { timestamp, _id } = decodeCursor(cursor);
      query.$or = [
        { timestamp: { $lt: new Date(timestamp!) } },
        { 
          timestamp: new Date(timestamp!),
          _id: { $lt: new mongoose.Types.ObjectId(_id) }
        },
      ];
    }

    return AuditLogModel.find(query)
      .sort({ timestamp: -1, _id: -1 })
      .limit(limit)
      .exec();
  }
}
