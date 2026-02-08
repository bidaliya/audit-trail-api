import { UserRole } from '@/shared/contracts';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
}
