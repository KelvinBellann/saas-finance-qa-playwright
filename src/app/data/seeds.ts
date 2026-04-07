import type { Transaction, User } from '../types/finance.js';

export const seedUsers: User[] = [
  {
    id: 'usr-finance-manager',
    name: 'Marina Costa',
    email: 'finance.manager@sentinel.local',
    password: 'Playwright@123',
    role: 'finance_manager',
    status: 'active',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'usr-finance-analyst',
    name: 'Rafael Nunes',
    email: 'finance.analyst@sentinel.local',
    password: 'Playwright@123',
    role: 'finance_analyst',
    status: 'active',
    createdAt: '2026-03-03T11:15:00.000Z',
  },
];

export const seedTransactions: Transaction[] = [
  {
    id: 'txn-paid-001',
    description: 'Licenciamento do ERP financeiro',
    beneficiary: 'ERP Cloud SA',
    category: 'software',
    amount: 1820.5,
    status: 'pago',
    createdByUserId: 'usr-finance-manager',
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-18T16:20:00.000Z',
    approvedAt: '2026-03-16T09:35:00.000Z',
    paidAt: '2026-03-18T16:20:00.000Z',
  },
  {
    id: 'txn-approved-001',
    description: 'Comissao comercial regional',
    beneficiary: 'Equipe Comercial Sul',
    category: 'people',
    amount: 860.75,
    status: 'aprovado',
    createdByUserId: 'usr-finance-analyst',
    createdAt: '2026-03-20T14:45:00.000Z',
    updatedAt: '2026-03-21T10:10:00.000Z',
    approvedAt: '2026-03-21T10:10:00.000Z',
  },
  {
    id: 'txn-pending-001',
    description: 'Reposicao de materiais do escritorio',
    beneficiary: 'Office Market',
    category: 'operations',
    amount: 245.9,
    status: 'pendente',
    createdByUserId: 'usr-finance-manager',
    createdAt: '2026-03-25T08:30:00.000Z',
    updatedAt: '2026-03-25T08:30:00.000Z',
  },
];
