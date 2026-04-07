document.addEventListener('DOMContentLoaded', async () => {
  const app = window.financeApp;
  await app.initializeShell('transactions');

  const form = document.querySelector('[data-testid="transaction-form"]');
  const feedback = document.querySelector('[data-testid="transaction-feedback"]');
  const tableBody = document.querySelector('[data-testid="transactions-table-body"]');

  async function refreshTransactions() {
    const { transactions } = await app.request('/api/transactions');

    tableBody.innerHTML = transactions
      .map((transaction) => {
        const approveButton =
          transaction.status === 'pendente'
            ? `<button class="button button--secondary" type="button" data-action="approve" data-transaction-id="${transaction.id}" data-testid="approve-transaction-button">Aprovar</button>`
            : '';
        const payButton =
          transaction.status === 'aprovado'
            ? `<button class="button button--primary" type="button" data-action="pay" data-transaction-id="${transaction.id}" data-testid="pay-transaction-button">Marcar como pago</button>`
            : '';

        return `
          <tr data-testid="transaction-row">
            <td data-testid="transaction-description">${app.escapeHtml(transaction.description)}</td>
            <td>${app.escapeHtml(transaction.beneficiary)}</td>
            <td>${app.escapeHtml(transaction.category)}</td>
            <td data-testid="transaction-amount">${app.formatCurrency(transaction.amount)}</td>
            <td data-testid="transaction-status">${app.badge(transaction.status)}</td>
            <td class="table-actions">${approveButton}${payButton}</td>
          </tr>
        `;
      })
      .join('');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      await app.request('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          description: formData.get('description'),
          beneficiary: formData.get('beneficiary'),
          category: formData.get('category'),
          amount: Number(formData.get('amount')),
        }),
      });

      app.setFeedback(feedback, 'Transacao criada com sucesso.');
      form.reset();
      form.querySelector('[data-testid="transaction-category-select"]').value = 'software';
      await refreshTransactions();
    } catch (error) {
      app.setFeedback(feedback, error.message, 'error');
    }
  });

  tableBody.addEventListener('click', async (event) => {
    const trigger = event.target.closest('button[data-action]');
    if (!trigger) {
      return;
    }

    const transactionId = trigger.dataset.transactionId;
    const nextStatus = trigger.dataset.action === 'approve' ? 'aprovado' : 'pago';

    try {
      await app.request(`/api/transactions/${transactionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      app.setFeedback(feedback, `Transacao atualizada para ${nextStatus}.`);
      await refreshTransactions();
    } catch (error) {
      app.setFeedback(feedback, error.message, 'error');
    }
  });

  await refreshTransactions();
});
