import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { getRequestId } from '@/infra/requestContext/context';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import type { ErrorDetails, ValidationIssue } from './error.types';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = getRequestId();

  // Log error
  logger.error({
    err,
    requestId,
    path: req.path,
    method: req.method,
  }, 'Request error');

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: ErrorDetails = err.errors.map((issue): ValidationIssue => ({
      path: issue.path,
      message: issue.message,
      code: issue.code,
    }));

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
        requestId,
      },
    });
    return;
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
    return;
  }

  // Handle unclassified errors
  const isDev = env.NODE_ENV === 'development';
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: isDev ? err.message : 'Internal server error',
      requestId,
    },
  });
}
