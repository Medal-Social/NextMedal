/**
 * k6 Load Test Script - Homepage
 *
 * Tests the homepage under load to ensure performance meets thresholds.
 *
 * Prerequisites:
 *   brew install k6  # macOS
 *   # or
 *   docker pull grafana/k6  # Docker
 *
 * Run with:
 *   k6 run tests/load/scripts/homepage.js
 *
 * Run with Docker:
 *   docker run -i grafana/k6 run - < tests/load/scripts/homepage.js
 */

import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 }, // Stay at 50 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be < 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(BASE_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has content': (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
