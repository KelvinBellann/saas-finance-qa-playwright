import { randomUUID } from 'node:crypto';
import type {
  ReportSummary,
  SafeUser,
  Session,
  StatementSummary,
  Transaction,
  TransactionInput,
  TransactionStatus,
  User,
  UserInput,
} from '../types/finance.js';
import { seedTransactions, seedUsers } from './seeds.js';

const transactionStatuses: TransactionStatus[] = ['pendente', 'aprovado', 'pago'];

function clone<T>(value: T): T {
  return structuredClone(value);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function ensurePositiveAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Informe um valor financeiro valido e maior que zero.');
  }

  return Number(amount.toFixed(2));
}

function buildStatementSummary(transactions: Transaction[]): StatementSummary {
  return transactions.reduce<StatementSummary>(
    (summary, transaction) => {
      summary.totalEntries += 1;
      summary.totalVolume += transaction.amount;

      if (transaction.status === 'pendente') {
        summary.pendingAmount += transaction.amount;
      }

      if (transaction.status === 'aprovado') {
        summary.approvedAmount += transaction.amount;
      }

      if (transaction.status === 'pago') {
        summary.paidAmount += transaction.amount;
      }

      return summary;
    },
    {
      totalEntries: 0,
      totalVolume: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
    },
  );
}

export function sanitizeUser(user: User): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export class FinanceStore {
  private readonly users = new Map<string, User>();
  private readonly transactions = new Map<string, Transaction>();
  private readonly sessions = new Map<string, Session>();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.users.clear();
    this.transactions.clear();
    this.sessions.clear();

    for (const user of seedUsers) {
      this.users.set(user.id, clone(user));
    }

    for (const transaction of seedTransactions) {
      this.transactions.set(transaction.id, clone(transaction));
    }
  }

  listUsers(): SafeUser[] {
    return [...this.users.values()].map((user) => sanitizeUser(clone(user)));
  }

  getUserById(userId: string): SafeUser | undefined {
    const user = this.users.get(userId);
    return user ? sanitizeUser(clone(user)) : undefined;
  }

  findUserByEmail(email: string): User | undefined {
    const normalizedEmail = normalizeEmail(email);
    return [...this.users.values()].find((user) => normalizeEmail(user.email) === normalizedEmail);
  }

  createUser(input: UserInput): SafeUser {
    if (!input.name.trim()) {
      throw new Error('Nome do usuario e obrigatorio.');
    }

    if (!input.password.trim()) {
      throw new Error('Senha do usuario e obrigatoria.');
    }

    if (this.findUserByEmail(input.email)) {
      throw new Error('Ja existe um usuario com este email.');
    }

    const user: User = {
      id: randomUUID(),
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      password: input.password,
      role: input.role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, clone(user));
    return sanitizeUser(user);
  }

  authenticate(email: string, password: string): SafeUser | undefined {
    const user = this.findUserByEmail(email);

    if (!user || user.password !== password) {
      return undefined;
    }

    return sanitizeUser(clone(user));
  }

  createSession(userId: string): string {
    const sessionId = randomUUID();

    this.sessions.set(sessionId, {
      id: sessionId,
      userId,
      issuedAt: new Date().toISOString(),
    });

    return sessionId;
  }

  removeSession(sessionId?: string): void {
    if (!sessionId) {
      return;
    }

    this.sessions.delete(sessionId);
  }

  getUserBySession(sessionId?: string): SafeUser | undefined {
    if (!sessionId) {
      return undefined;
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    return this.getUserById(session.userId);
  }

  listTransactions(status?: string): Transaction[] {
    return [...this.transactions.values()]
      .filter((transaction) => !status || transaction.status === status)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((transaction) => clone(transaction));
  }

  createTransaction(input: TransactionInput, currentUserId: string): Transaction {
    if (!input.description.trim()) {
      throw new Error('Descricao da transacao e obrigatoria.');
    }

    if (!input.beneficiary.trim()) {
      throw new Error('Beneficiario da transacao e obrigatorio.');
    }

    const amount = ensurePositiveAmount(input.amount);
    const timestamp = new Date().toISOString();

    const transaction: Transaction = {
      id: randomUUID(),
      description: input.description.trim(),
      beneficiary: input.beneficiary.trim(),
      category: input.category.trim() || 'general',
      amount,
      status: 'pendente',
      createdByUserId: currentUserId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.transactions.set(transaction.id, clone(transaction));
    return clone(transaction);
  }

  updateTransactionStatus(transactionId: string, nextStatus: TransactionStatus): Transaction {
    if (!transactionStatuses.includes(nextStatus)) {
      throw new Error('Status financeiro invalido.');
    }

    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error('Transacao nao encontrada.');
    }

    if (transaction.status === nextStatus) {
      return clone(transaction);
    }

    const invalidTransition =
      (transaction.status === 'pendente' && nextStatus === 'pago') ||
      (transaction.status === 'pago' && nextStatus !== 'pago') ||
      (transaction.status === 'aprovado' && nextStatus === 'pendente');

    if (invalidTransition) {
      throw new Error('Transicao de status invalida para esta transacao.');
    }

    const updatedAt = new Date().toISOString();
    const updatedTransaction: Transaction = {
      ...transaction,
      status: nextStatus,
      updatedAt,
      approvedAt: nextStatus === 'aprovado' || nextStatus === 'pago' ? transaction.approvedAt ?? updatedAt : undefined,
      paidAt: nextStatus === 'pago' ? updatedAt : undefined,
    };

    this.transactions.set(transactionId, clone(updatedTransaction));
    return clone(updatedTransaction);
  }

  getStatement(status?: string): { entries: Transaction[]; totals: StatementSummary } {
    const entries = this.listTransactions(status);
    return {
      entries,
      totals: buildStatementSummary(entries),
    };
  }

  getReportSummary(): ReportSummary {
    const transactions = this.listTransactions();
    const statement = buildStatementSummary(transactions);
    const pendingCount = transactions.filter((transaction) => transaction.status === 'pendente').length;
    const approvedCount = transactions.filter((transaction) => transaction.status === 'aprovado').length;
    const paidCount = transactions.filter((transaction) => transaction.status === 'pago').length;
    const approvedOrPaidCount = transactions.filter((transaction) => transaction.status !== 'pendente').length;

    return {
      generatedAt: new Date().toISOString(),
      totalTransactions: transactions.length,
      activeUsers: this.users.size,
      totalVolume: Number(statement.totalVolume.toFixed(2)),
      pendingAmount: Number(statement.pendingAmount.toFixed(2)),
      approvedAmount: Number(statement.approvedAmount.toFixed(2)),
      paidAmount: Number(statement.paidAmount.toFixed(2)),
      pendingCount,
      approvedCount,
      paidCount,
      approvalRate: transactions.length === 0 ? 0 : Number(((approvedOrPaidCount / transactions.length) * 100).toFixed(1)),
    };
  }
}

export const financeStore = new FinanceStore();
