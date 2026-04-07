document.addEventListener('DOMContentLoaded', async () => {
  const app = window.financeApp;
  await app.initializeShell('statement');

  const filter = document.querySelector('[data-testid="statement-status-filter"]');
  const tableBody = document.querySelector('[data-testid="statement-table-body"]');

  async function loadStatement() {
    const status = filter.value;
    const query = status ? `?status=${status}` : '';
    const { statement } = await app.request(`/api/statement${query}`);

    document.querySelector('[data-testid="statement-total-volume"]').textContent = app.formatCurrency(statement.totals.totalVolume);
    document.querySelector('[data-testid="statement-paid-total"]').textContent = app.formatCurrency(statement.totals.paidAmount);
    document.querySelector('[data-testid="statement-approved-total"]').textContent = app.formatCurrency(statement.totals.approvedAmount);
    document.querySelector('[data-testid="statement-pending-total"]').textContent = app.formatCurrency(statement.totals.pendingAmount);

    tableBody.innerHTML = statement.entries
      .map(
        (entry) => `
          <tr data-testid="statement-row">
            <td data-testid="statement-description">${app.escapeHtml(entry.description)}</td>
            <td>${app.escapeHtml(entry.beneficiary)}</td>
            <td data-testid="statement-amount">${app.formatCurrency(entry.amount)}</td>
            <td data-testid="statement-status">${app.badge(entry.status)}</td>
            <td>${app.escapeHtml(entry.createdBy)}</td>
          </tr>
        `,
      )
      .join('');
  }

  filter.addEventListener('change', loadStatement);
  await loadStatement();
});
