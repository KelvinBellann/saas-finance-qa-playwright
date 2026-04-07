import { test, expect } from '../../fixtures/test-fixtures.js';

test.describe('API | Authentication and users', () => {
  test('should authenticate seeded finance manager and expose current user', async ({ financeApi, testData }) => {
    const loginResponse = await financeApi.login(testData.users.financeManager.email, testData.users.financeManager.password);
    const currentUser = await financeApi.getCurrentUser();

    expect(loginResponse.token).toBeTruthy();
    expect(loginResponse.user.email).toBe(testData.users.financeManager.email);
    expect(currentUser.user.name).toBe(testData.users.financeManager.name);
  });

  test('should reject invalid credentials on login endpoint', async ({ request, testData }) => {
    const response = await request.post('/api/auth/login', {
      data: testData.users.invalidCredentials,
    });

    const payload = await response.json();

    expect(response.status()).toBe(401);
    expect(payload.message).toContain('Credenciais invalidas');
  });

  test('should create a new viewer after manager authentication', async ({ financeApi, testData }) => {
    await financeApi.login(testData.users.financeManager.email, testData.users.financeManager.password);

    const createUserResponse = await financeApi.createUser(testData.users.newViewer);

    expect(createUserResponse.user.email).toBe(testData.users.newViewer.email);
    expect(createUserResponse.user.role).toBe(testData.users.newViewer.role);

    const viewerSession = await financeApi.login(testData.users.newViewer.email, testData.users.newViewer.password);

    expect(viewerSession.user.email).toBe(testData.users.newViewer.email);
  });
});
