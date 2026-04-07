import type { Request } from 'express';

export const SESSION_COOKIE_NAME = 'finance_session';

export function resolveSessionToken(request: Request): string | undefined {
  const authHeader = request.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return request.cookies[SESSION_COOKIE_NAME] as string | undefined;
}
