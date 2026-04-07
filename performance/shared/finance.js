import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.K6_BASE_URL || 'http://127.0.0.1:3000';

const defaultCredentials = {
  email: __ENV.K6_USER_EMAIL || 'finance.manager@sentinel.local',
  password: __ENV.K6_USER_PASSWORD || 'Playwright@123',
};

export function login() {
  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(defaultCredentials),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        name: 'auth_login',
      },
    },
  );

  check(response, {
    'auth login returned 200': (result) => result.status === 200,
  });

  return JSON.parse(response.body).token;
}

export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

export function buildTransactionPayload(iteration) {
  return {
    description: `Carga financeira ${iteration}`,
    beneficiary: 'Ops Vendor Hub',
    category: 'vendors',
    amount: 500 + iteration,
  };
}
