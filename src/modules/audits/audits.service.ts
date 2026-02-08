import { AuditTrailRepository } from '@/modules/auditTrail/auditTrail.repository';
import type { IAuditLog } from '@/modules/auditTrail/auditLog.model';
import type { AuditQueryFilters, AuditValue } from '@/modules/auditTrail/auditTrail.types';
import type { AuditLogResponse, UserSummary } from '@/modules/audits/audits.types';
import { AuthRepository } from '@/modules/auth';
import { isValidObjectId, Types } from 'mongoose';
import { NotFoundError } from '@/shared/errors/AppError';

function isObjectIdLike(value: AuditValue | null | undefined): value is Types.ObjectId {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Array.isArray(value) || value instanceof Date) {
    return false;
  }

  return isValidObjectId(value);
}

export class AuditsService {
  private authRepository = new AuthRepository();

  constructor(private repository: AuditTrailRepository) {}

  async getAudits(filters: AuditQueryFilters, limit: number, cursor?: string): Promise<AuditLogResponse[]> {
    const resolvedFilters = await this.resolveActorNameFilter(filters);
    if (resolvedFilters === null) {
      return [];
    }

    const audits = await this.repository.findWithFilters(resolvedFilters, limit, cursor);
    return this.enrichWithUsers(audits);
  }

  async getAuditById(id: string): Promise<AuditLogResponse> {
    const audit = await this.repository.findById(id);
    if (!audit) {
      throw new NotFoundError('Audit log not found');
    }
    const [enriched] = await this.enrichWithUsers([audit]);
    return enriched;
  }

  private async resolveActorNameFilter(
    filters: AuditQueryFilters
  ): Promise<AuditQueryFilters | null> {
    if (filters.actorId) {
      return filters;
    }

    const actorName = filters.actorName?.trim();
    if (!actorName) {
      return filters;
    }

    const users = await this.authRepository.findByNameLike(actorName);
    if (users.length === 0) {
      return null;
    }

    return {
      ...filters,
      actorIds: users.map((user) => user._id.toString()),
    };
  }

  private async enrichWithUsers(audits: IAuditLog[]): Promise<AuditLogResponse[]> {
    const auditUserIds = audits.map((audit) => this.extractRelatedUserIds(audit));
    const uniqueUserIds = new Set<string>();
    for (const ids of auditUserIds) {
      for (const id of ids) {
        uniqueUserIds.add(id);
      }
    }

    for (const audit of audits) {
      if (isValidObjectId(audit.actorId)) {
        uniqueUserIds.add(audit.actorId);
      }
    }

    const users = await this.authRepository.findByIds(Array.from(uniqueUserIds));
    const userMap = new Map<string, UserSummary>(
      users.map((user) => [user._id.toString(), { id: user._id.toString(), name: user.name, role: user.role }])
    );

    return audits.map((audit, index) => {
      const relatedUsers: Record<string, UserSummary> = {};
      for (const id of auditUserIds[index]) {
        const user = userMap.get(id);
        if (user) {
          relatedUsers[id] = user;
        }
      }

      const actor = userMap.get(audit.actorId);

      const auditObj = audit.toObject() as AuditLogResponse;
      if (Object.keys(relatedUsers).length === 0) {
        if (!actor) {
          return auditObj;
        }
        return {
          ...auditObj,
          actor,
        };
      }

      return {
        ...auditObj,
        actor,
        relatedUsers,
      };
    });
  }

  private extractRelatedUserIds(audit: IAuditLog): string[] {
    const ids = new Set<string>();
    const byFieldSuffix = 'By';

    for (const op of audit.diff) {
      const field = op.path.startsWith('/') ? op.path.slice(1) : op.path;
      if (!field.endsWith(byFieldSuffix)) {
        continue;
      }

      const candidate = op.after ?? op.before;
      if (candidate === undefined || candidate === null) {
        continue;
      }
      if (typeof candidate === 'string') {
        if (isValidObjectId(candidate)) {
          ids.add(candidate);
        }
      } else if (isObjectIdLike(candidate)) {
        ids.add(candidate.toHexString());
      } else if (candidate && typeof candidate === 'object') {
        const maybeId = (candidate as { id?: string }).id;
        if (typeof maybeId === 'string' && isValidObjectId(maybeId)) {
          ids.add(maybeId);
        }
      }
    }

    return Array.from(ids);
  }
}
