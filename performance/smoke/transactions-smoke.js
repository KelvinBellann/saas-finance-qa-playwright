import { check, sleep } from 'k6';
import http from 'k6/http';
import { authHeaders, BASE_URL, buildTransactionPayload, login } from '../shared/finance.js';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  return {
    token: login(),
  };
}

export default function (data) {
  const createTransactionResponse = http.post(
    `${BASE_URL}/api/transactions`,
    JSON.stringify(buildTransactionPayload(__ITER + 1)),
    {
      ...authHeaders(data.token),
      tags: {
        name: 'create_transaction_smoke',
      },
    },
  );

  const reportResponse = http.get(`${BASE_URL}/api/reports/summary`, {
    ...authHeaders(data.token),
    tags: {
      name: 'report_summary_smoke',
    },
  });

  check(createTransactionResponse, {
    'smoke transaction creation returned 201': (response) => response.status === 201,
  });

  check(reportResponse, {
    'smoke report summary returned 200': (response) => response.status === 200,
  });

  sleep(1);
}
