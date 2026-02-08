import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema } from '@/shared/contracts';
import { sendSuccess } from '@/shared/http/response';

export class AuthController {
  constructor(private service: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, credential } = loginSchema.parse(req.body);
      const result = await this.service.login(name, credential);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}
