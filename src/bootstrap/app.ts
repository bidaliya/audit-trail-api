import express, { Express } from 'express';
import { requestContextMiddleware } from '@/infra/requestContext/middleware';
import { httpLogger } from '@/infra/logging/httpLogger';
import { corsMiddleware } from '@/infra/security/cors';
import { securityHeaders } from '@/infra/security/headers';
import { rateLimiter } from '@/infra/security/rateLimit';
import { errorMiddleware } from '@/shared/errors/errorMiddleware';
import { createAuthModule } from '@/modules/auth';
import { createBookModule } from '@/modules/books';
import { createAuditsModule } from '@/modules/audits';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(securityHeaders);
  app.use(corsMiddleware);

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request context (must be before routes)
  app.use(requestContextMiddleware);

  // HTTP logging
  app.use(httpLogger);

  // Rate limiting
  app.use(rateLimiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Module routes
  const { router: authRouter, authMiddleware } = createAuthModule();
  app.use('/api/auth', authRouter);
  app.use('/api/books', createBookModule(authMiddleware));
  app.use('/api/audits', createAuditsModule(authMiddleware));

  // Error handling (must be last)
  app.use(errorMiddleware);

  return app;
}
