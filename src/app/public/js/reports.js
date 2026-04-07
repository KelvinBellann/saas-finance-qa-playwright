document.addEventListener('DOMContentLoaded', async () => {
  const app = window.financeApp;
  await app.initializeShell('reports');

  const { summary } = await app.request('/api/reports/summary');

  document.querySelector('[data-testid="report-total-volume"]').textContent = app.formatCurrency(summary.totalVolume);
  document.querySelector('[data-testid="report-paid-total"]').textContent = app.formatCurrency(summary.paidAmount);
  document.querySelector('[data-testid="report-approval-rate"]').textContent = app.formatPercent(summary.approvalRate);
  document.querySelector('[data-testid="report-users-count"]').textContent = String(summary.activeUsers);
  document.querySelector('[data-testid="report-pending-count"]').textContent = String(summary.pendingCount);
  document.querySelector('[data-testid="report-approved-count"]').textContent = String(summary.approvedCount);
  document.querySelector('[data-testid="report-paid-count"]').textContent = String(summary.paidCount);
  document.querySelector('[data-testid="report-generated-at"]').textContent = new Date(summary.generatedAt).toLocaleString('pt-BR');
});
