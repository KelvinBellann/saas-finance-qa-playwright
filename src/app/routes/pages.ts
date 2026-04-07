import type { Express, RequestHandler } from 'express';
import path from 'node:path';
import { SESSION_COOKIE_NAME } from '../auth.js';
import type { FinanceStore } from '../data/finance-store.js';

function resolveHtmlFile(publicDir: string, fileName: string): string {
  return path.join(publicDir, fileName);
}

export function registerPageRoutes(app: Express, store: FinanceStore, publicDir: string): void {
  const requireSession: RequestHandler = (request, response, next) => {
    const user = store.getUserBySession(request.cookies[SESSION_COOKIE_NAME] as string | undefined);

    if (!user) {
      response.redirect('/login');
      return;
    }

    response.locals.currentUser = user;
    next();
  };

  app.get('/', (_request, response) => {
    response.redirect('/login');
  });

  app.get('/login', (request, response) => {
    const activeUser = store.getUserBySession(request.cookies[SESSION_COOKIE_NAME] as string | undefined);

    if (activeUser) {
      response.redirect('/dashboard');
      return;
    }

    response.sendFile(resolveHtmlFile(publicDir, 'login.html'));
  });

  app.get('/dashboard', requireSession, (_request, response) => {
    response.sendFile(resolveHtmlFile(publicDir, 'dashboard.html'));
  });

  app.get('/transactions', requireSession, (_request, response) => {
    response.sendFile(resolveHtmlFile(publicDir, 'transactions.html'));
  });

  app.get('/statement', requireSession, (_request, response) => {
    response.sendFile(resolveHtmlFile(publicDir, 'statement.html'));
  });

  app.get('/reports', requireSession, (_request, response) => {
    response.sendFile(resolveHtmlFile(publicDir, 'reports.html'));
  });
}
