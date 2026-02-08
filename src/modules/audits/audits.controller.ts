import { Request, Response, NextFunction } from 'express';
import { AuditsService } from './audits.service';
import { auditQuerySchema } from '@/shared/contracts';
import { sendSuccess } from '@/shared/http/response';
import { buildPaginationResponse } from '@/shared/http/pagination';

export class AuditsController {
  constructor(private service: AuditsService) {}

  getAudits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = auditQuerySchema.parse(req.query);

      const fieldsChanged = query.fieldsChanged
        ? query.fieldsChanged.split(',').map((field) => field.trim())
        : undefined;

      const filters = {
        from: query.from,
        to: query.to,
        entity: query.entity,
        entityId: query.entityId,
        actorId: query.actorId,
        actorName: query.actorName,
        action: query.action,
        fieldsChanged,
        requestId: query.requestId,
      };

      const limit = query.limit ?? 10;
      const cursor = query.cursor;

      const audits = await this.service.getAudits(filters, limit, cursor);
      const response = buildPaginationResponse(audits, limit, 'timestamp');

      sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  };

  getAudit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const audit = await this.service.getAuditById(req.params.id);
      sendSuccess(res, audit);
    } catch (error) {
      next(error);
    }
  };
}
