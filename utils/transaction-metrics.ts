import type { TransactionStatus } from '../src/app/types/finance.js';

export interface TransactionLike {
  amount: number;
  status: TransactionStatus;
}

export function summarizeTransactions(transactions: TransactionLike[]) {
  const pendingAmount = transactions
    .filter((transaction) => transaction.status === 'pendente')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const approvedAmount = transactions
    .filter((transaction) => transaction.status === 'aprovado')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const paidAmount = transactions
    .filter((transaction) => transaction.status === 'pago')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const pendingCount = transactions.filter((transaction) => transaction.status === 'pendente').length;
  const approvedCount = transactions.filter((transaction) => transaction.status === 'aprovado').length;
  const paidCount = transactions.filter((transaction) => transaction.status === 'pago').length;

  return {
    totalVolume: Number((pendingAmount + approvedAmount + paidAmount).toFixed(2)),
    pendingAmount: Number(pendingAmount.toFixed(2)),
    approvedAmount: Number(approvedAmount.toFixed(2)),
    paidAmount: Number(paidAmount.toFixed(2)),
    pendingCount,
    approvedCount,
    paidCount,
    approvalRate:
      transactions.length === 0
        ? 0
        : Number((((approvedCount + paidCount) / transactions.length) * 100).toFixed(1)),
  };
}
