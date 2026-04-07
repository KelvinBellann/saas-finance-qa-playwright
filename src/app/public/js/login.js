document.addEventListener('DOMContentLoaded', async () => {
  const app = window.financeApp;
  const form = document.querySelector('[data-testid="login-form"]');
  const feedback = document.querySelector('[data-testid="login-error-alert"]');
  const submitButton = document.querySelector('[data-testid="login-submit-button"]');

  try {
    await app.request('/api/me');
    window.location.href = '/dashboard';
    return;
  } catch (error) {
    if (error.status !== 401) {
      throw error;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    app.setFeedback(feedback, '');

    const formData = new FormData(form);

    try {
      await app.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      window.location.href = '/dashboard';
    } catch (error) {
      app.setFeedback(feedback, error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
});
