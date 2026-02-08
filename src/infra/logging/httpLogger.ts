import pinoHttp from 'pino-http';
import { logger } from '@/config/logger';
import { getRequestContext } from '@/infra/requestContext/context';

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'durationMs',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      route: req.route?.path,
    }),
    res: (res) => ({
      status: res.statusCode,
    }),
  },
  customProps: (req, res) => {
    const context = getRequestContext();
    return {
      requestId: context?.requestId,
      userId: context?.userId,
      role: context?.role,
    };
  },
});
