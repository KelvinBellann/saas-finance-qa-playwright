import type { Express, RequestHandler, Response } from 'express';
import { resolveSessionToken, SESSION_COOKIE_NAME } from '../auth.js';
import { clearLoginRateLimitForRequest, clearLoginRateLimitState, createLoginRateLimiter, recordFailedLoginAttempt } from '../security.js';
import { sanitizeUser, type FinanceStore } from '../data/finance-store.js';
import type { SafeUser, Transaction, TransactionStatus, UserRole } from '../types/finance.js';

interface ApiError {
  message: string;
}

function sendError(response: Response, statusCode: number, message: string): Response<ApiError> {
  return response.status(statusCode).json({ message });
}

function asRole(value: string | undefined): UserRole {
  if (value === 'finance_manager' || value === 'finance_analyst' || value === 'finance_viewer') {
    return value;
  }

  return 'finance_viewer';
}

function serializeTransaction(store: FinanceStore, transaction: Transaction) {
  const createdBy = store.getUserById(transaction.createdByUserId);

  return {
    ...transaction,
    createdBy: createdBy?.name ?? 'Sistema',
  };
}

export function registerApiRoutes(app: Express, store: FinanceStore): void {
  const loginRateLimiter = createLoginRateLimiter();

  const requireSession: RequestHandler = (request, response, next) => {
    const user = store.getUserBySession(resolveSessionToken(request));

    if (!user) {
      sendError(response, 401, 'Sessao invalida ou expirada.');
      return;
    }

    response.locals.currentUser = user;
    next();
  };

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'sentinel-finance-api',
      version: '1.0.0',
    });
  });

  app.post('/api/auth/login', loginRateLimiter, (request, response) => {
    const email = typeof request.body.email === 'string' ? request.body.email : '';
    const password = typeof request.body.password === 'string' ? request.body.password : '';
    const user = store.authenticate(email, password);

    if (!user) {
      recordFailedLoginAttempt(request);
      sendError(response, 401, 'Credenciais invalidas. Verifique email e senha.');
      return;
    }

    const sessionId = store.createSession(user.id);
    clearLoginRateLimitForRequest(request);

    response.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    response.json({
      message: 'Login realizado com sucesso.',
      token: sessionId,
      user,
    });
  });

  app.post('/api/auth/logout', (request, response) => {
    store.removeSession(resolveSessionToken(request));
    response.clearCookie(SESSION_COOKIE_NAME).status(204).end();
  });

  app.get('/api/me', requireSession, (_request, response) => {
    response.json({
      user: response.locals.currentUser as SafeUser,
    });
  });

  app.post('/api/users', requireSession, (request, response) => {
    const currentUser = response.locals.currentUser as SafeUser;

    if (currentUser.role !== 'finance_manager') {
      sendError(response, 403, 'Apenas gestores financeiros podem cadastrar usuarios.');
      return;
    }

    try {
      const user = store.createUser({
        name: typeof request.body.name === 'string' ? request.body.name : '',
        email: typeof request.body.email === 'string' ? request.body.email : '',
        password: typeof request.body.password === 'string' ? request.body.password : '',
        role: asRole(typeof request.body.role === 'string' ? request.body.role : undefined),
      });

      response.status(201).json({
        message: 'Usuario cadastrado com sucesso.',
        user,
      });
    } catch (error) {
      sendError(response, 400, error instanceof Error ? error.message : 'Falha ao cadastrar usuario.');
    }
  });

  app.get('/api/transactions', requireSession, (request, response) => {
    const status = typeof request.query.status === 'string' ? request.query.status : undefined;
    const transactions = store.listTransactions(status).map((transaction) => serializeTransaction(store, transaction));

    response.json({ transactions });
  });

  app.post('/api/transactions', requireSession, (request, response) => {
    try {
      const currentUser = response.locals.currentUser as SafeUser;
      const transaction = store.createTransaction(
        {
          description: typeof request.body.description === 'string' ? request.body.description : '',
          beneficiary: typeof request.body.beneficiary === 'string' ? request.body.beneficiary : '',
          category: typeof request.body.category === 'string' ? request.body.category : '',
          amount: Number(request.body.amount),
        },
        currentUser.id,
      );

      response.status(201).json({
        message: 'Transacao criada com sucesso.',
        transaction: serializeTransaction(store, transaction),
      });
    } catch (error) {
      sendError(response, 400, error instanceof Error ? error.message : 'Falha ao criar transacao.');
    }
  });

  app.patch('/api/transactions/:transactionId/status', requireSession, (request, response) => {
    try {
      const nextStatus = request.body.status as TransactionStatus;
      const transactionId = String(request.params.transactionId);
      const transaction = store.updateTransactionStatus(transactionId, nextStatus);

      response.json({
        message: `Transacao atualizada para ${nextStatus}.`,
        transaction: serializeTransaction(store, transaction),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar status financeiro.';
      const statusCode = message.includes('nao encontrada') ? 404 : 400;
      sendError(response, statusCode, message);
    }
  });

  app.get('/api/statement', requireSession, (request, response) => {
    const status = typeof request.query.status === 'string' ? request.query.status : undefined;
    const statement = store.getStatement(status);

    response.json({
      statement: {
        entries: statement.entries.map((transaction) => serializeTransaction(store, transaction)),
        totals: statement.totals,
      },
    });
  });

  app.get('/api/reports/summary', requireSession, (_request, response) => {
    response.json({
      summary: store.getReportSummary(),
      users: store.listUsers(),
    });
  });

  app.post('/api/test/reset', (_request, response) => {
    if (process.env.TEST_MODE !== 'true') {
      sendError(response, 404, 'Endpoint de reset disponivel apenas em modo de teste.');
      return;
    }

    store.reset();
    clearLoginRateLimitState();
    response.status(204).end();
  });
}
