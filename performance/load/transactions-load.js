import { check, sleep } from 'k6';
import http from 'k6/http';
import { authHeaders, BASE_URL, buildTransactionPayload, login } from '../shared/finance.js';

export const options = {
  scenarios: {
    finance_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 10 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.98'],
  },
};

export function setup() {
  return {
    token: login(),
  };
}

export default function (data) {
  const transactionPayload = buildTransactionPayload(__ITER + __VU);

  const createTransactionResponse = http.post(
    `${BASE_URL}/api/transactions`,
    JSON.stringify(transactionPayload),
    {
      ...authHeaders(data.token),
      tags: {
        name: 'create_transaction_load',
      },
    },
  );

  const statementResponse = http.get(`${BASE_URL}/api/statement`, {
    ...authHeaders(data.token),
    tags: {
      name: 'statement_load',
    },
  });

  check(createTransactionResponse, {
    'load transaction creation returned 201': (response) => response.status === 201,
  });

  check(statementResponse, {
    'load statement returned 200': (response) => response.status === 200,
  });

  sleep(1);
}
