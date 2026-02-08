import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors/AppError';
import { requestContextStorage, getRequestContext } from '@/infra/requestContext/context';
import { UserRole } from '@/shared/contracts';

export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.substring(7);
      const payload = this.authService.verifyToken(token);

      // Update request context with user info
      const currentContext = getRequestContext();
      if (currentContext) {
        requestContextStorage.enterWith({
          ...currentContext,
          userId: payload.userId,
          role: payload.role,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  requireRole = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const context = getRequestContext();
      
      if (!context?.role) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(context.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    };
  };
}
