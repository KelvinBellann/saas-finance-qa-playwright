(function () {
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const percentageFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      const error = new Error(payload?.message || 'Falha na comunicacao com o sistema financeiro.');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  function badge(status) {
    return `<span class="tag tag--${status}" data-testid="status-badge">${escapeHtml(status)}</span>`;
  }

  function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
  }

  function formatPercent(value) {
    return percentageFormatter.format(Number(value || 0) / 100);
  }

  function setActiveNavigation(route) {
    document.querySelectorAll('[data-nav]').forEach((element) => {
      element.classList.toggle('is-active', element.dataset.nav === route);
    });
  }

  async function initializeShell(route) {
    setActiveNavigation(route);

    const logoutButton = document.querySelector('[data-testid="logout-button"]');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '/login';
      });
    }

    const userNameElements = document.querySelectorAll('[data-testid="app-user-name"]');
    const userRoleElements = document.querySelectorAll('[data-testid="app-user-role"]');

    try {
      const { user } = await request('/api/me');

      userNameElements.forEach((element) => {
        element.textContent = user.name;
      });

      userRoleElements.forEach((element) => {
        element.textContent = user.role;
      });
    } catch (error) {
      if (error.status === 401) {
        window.location.href = '/login';
        return;
      }

      throw error;
    }
  }

  function setFeedback(element, message, type = 'success') {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.toggle('is-error', type === 'error');
  }

  window.financeApp = {
    badge,
    escapeHtml,
    formatCurrency,
    formatPercent,
    initializeShell,
    request,
    setFeedback,
  };
})();
