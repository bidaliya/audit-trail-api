import { AsyncLocalStorage } from 'async_hooks';
import { UserRole } from '@/shared/contracts';

export interface RequestContext {
  requestId: string;
  userId?: string;
  role?: UserRole;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export function getRequestId(): string {
  const context = getRequestContext();
  return context?.requestId || 'unavailable';
}

export function getUserId(): string | undefined {
  const context = getRequestContext();
  return context?.userId;
}

export function getUserRole(): UserRole | undefined {
  const context = getRequestContext();
  return context?.role;
}
