import type { Express, Request, RequestHandler } from 'express';

const DEFAULT_LOGIN_WINDOW_MS = 60_000;
const DEFAULT_MAX_LOGIN_ATTEMPTS = 5;

interface LoginAttemptState {
  count: number;
  firstAttemptAt: number;
}

const loginAttempts = new Map<string, LoginAttemptState>();

function resolveClientAddress(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() ?? 'local';
  }

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'local';
  }

  return request.ip || 'local';
}

function resolveLoginKey(request: Request): string {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : 'anonymous';
  return `${resolveClientAddress(request)}:${email}`;
}

function resolveWindowMs(): number {
  const candidate = Number(process.env.SECURITY_LOGIN_WINDOW_MS ?? DEFAULT_LOGIN_WINDOW_MS);
  return Number.isFinite(candidate) && candidate > 0 ? candidate : DEFAULT_LOGIN_WINDOW_MS;
}

function resolveMaxAttempts(): number {
  const candidate = Number(process.env.SECURITY_LOGIN_MAX_ATTEMPTS ?? DEFAULT_MAX_LOGIN_ATTEMPTS);
  return Number.isFinite(candidate) && candidate > 0 ? candidate : DEFAULT_MAX_LOGIN_ATTEMPTS;
}

function readAttemptState(request: Request): LoginAttemptState | undefined {
  const key = resolveLoginKey(request);
  const state = loginAttempts.get(key);

  if (!state) {
    return undefined;
  }

  if (Date.now() - state.firstAttemptAt >= resolveWindowMs()) {
    loginAttempts.delete(key);
    return undefined;
  }

  return state;
}

export function clearLoginRateLimitState(): void {
  loginAttempts.clear();
}

export function clearLoginRateLimitForRequest(request: Request): void {
  loginAttempts.delete(resolveLoginKey(request));
}

export function recordFailedLoginAttempt(request: Request): void {
  const key = resolveLoginKey(request);
  const state = readAttemptState(request);

  if (!state) {
    loginAttempts.set(key, {
      count: 1,
      firstAttemptAt: Date.now(),
    });
    return;
  }

  loginAttempts.set(key, {
    ...state,
    count: state.count + 1,
  });
}

export function createLoginRateLimiter(): RequestHandler {
  return (request, response, next) => {
    const state = readAttemptState(request);
    const maxAttempts = resolveMaxAttempts();

    if (!state || state.count < maxAttempts) {
      next();
      return;
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((resolveWindowMs() - (Date.now() - state.firstAttemptAt)) / 1000));
    response.setHeader('Retry-After', String(retryAfterSeconds));
    response.status(429).json({
      message: 'Muitas tentativas invalidas. Tente novamente mais tarde.',
    });
  };
}

export function applySecurityMiddleware(app: Express): void {
  app.disable('x-powered-by');

  app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );

    if (request.path.startsWith('/api/')) {
      response.setHeader('Cache-Control', 'no-store');
    }

    next();
  });
}
