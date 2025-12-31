/**
 * k6 Load Test Script - Search API
 *
 * Tests the search API endpoint under load.
 *
 * Run with:
 *   k6 run tests/load/scripts/api-search.js
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const searchDuration = new Trend('search_duration');
const searchFailRate = new Rate('search_failures');

export const options = {
  stages: [
    { duration: '20s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 }, // Stay at 10 users
    { duration: '20s', target: 30 }, // Ramp up to 30 users
    { duration: '1m', target: 30 }, // Stay at 30 users
    { duration: '20s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // API should be faster than page loads
    http_req_failed: ['rate<0.01'],
    search_duration: ['p(95)<250'],
    search_failures: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const searchTerms = ['blog', 'about', 'contact', 'services', 'home', 'test'];

export default function () {
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const url = `${BASE_URL}/api/search?q=${encodeURIComponent(term)}`;

  const res = http.get(url);

  searchDuration.add(res.timings.duration);
  searchFailRate.add(res.status !== 200);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
    'returns JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);
}
