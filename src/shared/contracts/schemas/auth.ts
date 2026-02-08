import { z } from 'zod';
import { USER_ROLES } from '../constants';

export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  credential: z.string().min(1, 'Credential is required'),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum([USER_ROLES.ADMIN, USER_ROLES.REVIEWER]),
  }),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
