import { seedTransactions } from '../../src/app/data/seeds.js';

const paidInvoice = seedTransactions.find((transaction) => transaction.id === 'txn-paid-001');
const approvedCommission = seedTransactions.find((transaction) => transaction.id === 'txn-approved-001');
const pendingOfficeSupply = seedTransactions.find((transaction) => transaction.id === 'txn-pending-001');

if (!paidInvoice || !approvedCommission || !pendingOfficeSupply) {
  throw new Error('Seed transactions are incomplete for the expected scenarios.');
}

export const seedTransactionCatalog = {
  paidInvoice,
  approvedCommission,
  pendingOfficeSupply,
};

export const transactionScenarios = {
  newPendingTransaction: {
    description: 'Assinatura analytics enterprise',
    beneficiary: 'Northwind Data Lab',
    category: 'software',
    amount: 1299.99,
  },
  endToEndSettlement: {
    description: 'Liquidacao fornecedor compliance',
    beneficiary: 'Compliance Suite Ltda',
    category: 'vendors',
    amount: 4150,
  },
  apiCriticalTransaction: {
    description: 'Provisionamento de folha complementar',
    beneficiary: 'Payroll Services',
    category: 'people',
    amount: 3325.42,
  },
};
