import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage, RequestContext } from './context';

function generateUuid(): string {
  return randomUUID();
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || generateUuid();
  
  const context: RequestContext = {
    requestId,
  };

  requestContextStorage.run(context, () => {
    // Attach requestId to response headers
    res.setHeader('x-request-id', requestId);
    next();
  });
}
