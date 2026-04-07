export type UserRole = 'finance_manager' | 'finance_analyst' | 'finance_viewer';
export type TransactionStatus = 'pendente' | 'aprovado' | 'pago';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  status: 'active';
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: 'active';
}

export interface Transaction {
  id: string;
  description: string;
  beneficiary: string;
  category: string;
  amount: number;
  status: TransactionStatus;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  issuedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface TransactionInput {
  description: string;
  beneficiary: string;
  category: string;
  amount: number;
}

export interface StatementSummary {
  totalEntries: number;
  totalVolume: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
}

export interface ReportSummary {
  generatedAt: string;
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
}
