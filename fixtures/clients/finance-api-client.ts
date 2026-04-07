import type { APIRequestContext, APIResponse } from '@playwright/test';

export class FinanceApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  private async parse<T>(response: APIResponse): Promise<T> {
    const contentType = response.headers()['content-type'] ?? '';
    const payload = contentType.includes('application/json') ? ((await response.json()) as T & { message?: string }) : undefined;

    if (!response.ok()) {
      throw new Error(payload?.message ?? `Request failed with status ${response.status()}.`);
    }

    return payload as T;
  }

  private withAuth(data?: unknown) {
    return {
      data,
      headers: this.token
        ? {
            Authorization: `Bearer ${this.token}`,
          }
        : undefined,
    };
  }

  async login(email: string, password: string) {
    const response = await this.request.post('/api/auth/login', {
      data: { email, password },
    });

    return this.parse<{
      message: string;
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }>(response);
  }

  async getCurrentUser() {
    const response = await this.request.get('/api/me', this.withAuth());
    return this.parse<{ user: { name: string; email: string; role: string } }>(response);
  }

  async createUser(payload: { name: string; email: string; password: string; role: string }) {
    const response = await this.request.post('/api/users', this.withAuth(payload));
    return this.parse<{ message: string; user: { name: string; email: string; role: string } }>(response);
  }

  async listTransactions() {
    const response = await this.request.get('/api/transactions', this.withAuth());
    return this.parse<{ transactions: Array<{ id: string; description: string; amount: number; status: string }> }>(response);
  }

  async createTransaction(payload: { description: string; beneficiary: string; category: string; amount: number }) {
    const response = await this.request.post('/api/transactions', this.withAuth(payload));
    return this.parse<{
      message: string;
      transaction: { id: string; description: string; amount: number; status: string; beneficiary: string };
    }>(response);
  }

  async updateTransactionStatus(transactionId: string, status: 'pendente' | 'aprovado' | 'pago') {
    const response = await this.request.patch(`/api/transactions/${transactionId}/status`, this.withAuth({ status }));
    return this.parse<{
      message: string;
      transaction: { id: string; description: string; amount: number; status: string };
    }>(response);
  }

  async getStatement(status?: 'pendente' | 'aprovado' | 'pago') {
    const query = status ? `?status=${status}` : '';
    const response = await this.request.get(`/api/statement${query}`, this.withAuth());
    return this.parse<{
      statement: {
        entries: Array<{ id: string; description: string; amount: number; status: string }>;
        totals: {
          totalEntries: number;
          totalVolume: number;
          pendingAmount: number;
          approvedAmount: number;
          paidAmount: number;
        };
      };
    }>(response);
  }

  async getReportSummary() {
    const response = await this.request.get('/api/reports/summary', this.withAuth());
    return this.parse<{
      summary: {
        totalTransactions: number;
        activeUsers: number;
        totalVolume: number;
        pendingAmount: number;
        approvedAmount: number;
        paidAmount: number;
        pendingCount: number;
        approvedCount: number;
        paidCount: number;
        approvalRate: number;
      };
    }>(response);
  }
}
