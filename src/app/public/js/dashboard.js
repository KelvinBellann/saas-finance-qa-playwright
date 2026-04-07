document.addEventListener('DOMContentLoaded', async () => {
  const app = window.financeApp;
  await app.initializeShell('dashboard');

  const summary = await app.request('/api/reports/summary');
  const transactions = await app.request('/api/transactions');

  document.querySelector('[data-testid="summary-total-volume"]').textContent = app.formatCurrency(summary.summary.totalVolume);
  document.querySelector('[data-testid="summary-pending-amount"]').textContent = app.formatCurrency(summary.summary.pendingAmount);
  document.querySelector('[data-testid="summary-approved-count"]').textContent = String(summary.summary.approvedCount);
  document.querySelector('[data-testid="summary-paid-amount"]').textContent = app.formatCurrency(summary.summary.paidAmount);
  document.querySelector('[data-testid="summary-active-users"]').textContent = String(summary.summary.activeUsers);
  document.querySelector('[data-testid="summary-approval-rate"]').textContent = app.formatPercent(summary.summary.approvalRate);

  const list = document.querySelector('[data-testid="recent-transactions-list"]');
  list.innerHTML = transactions.transactions
    .slice(0, 3)
    .map(
      (transaction) => `
        <li data-testid="recent-transaction-item">
          <div>
            <strong>${app.escapeHtml(transaction.description)}</strong>
            <div class="muted">${app.escapeHtml(transaction.beneficiary)}</div>
          </div>
          <div style="text-align: right;">
            <div>${app.formatCurrency(transaction.amount)}</div>
            <div>${app.badge(transaction.status)}</div>
          </div>
        </li>
      `,
    )
    .join('');
});
