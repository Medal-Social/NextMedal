/**
 * API Performance Tests
 *
 * Tests API endpoints against response time budgets defined in
 * performance-budget.config.ts
 */

import { describe, expect, test } from 'vitest';

const apiResponseTimes = {
  '/api/search': { p50: 200, p95: 500, p99: 1000 },
  '/api/draft-mode/enable': { p50: 200, p95: 500, p99: 1000 },
  '/api/draft-mode/disable': { p50: 200, p95: 500, p99: 1000 },
};

/**
 * Measure API response time
 */
async function measureResponseTime(url: string): Promise<number> {
  const start = performance.now();
  const response = await fetch(`http://localhost:3000${url}`);
  const end = performance.now();

  // Ensure response is valid
  expect(response.ok).toBe(true);

  return end - start;
}

/**
 * Run multiple requests and calculate percentiles
 */
async function benchmarkApi(
  url: string,
  iterations = 10
): Promise<{
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
}> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const time = await measureResponseTime(url);
    times.push(time);
  }

  times.sort((a, b) => a - b);

  const p50Index = Math.floor(times.length * 0.5);
  const p95Index = Math.floor(times.length * 0.95);
  const p99Index = Math.floor(times.length * 0.99);

  return {
    p50: times[p50Index],
    p95: times[p95Index],
    p99: times[p99Index],
    min: times[0],
    max: times[times.length - 1],
    avg: times.reduce((sum, time) => sum + time, 0) / times.length,
  };
}

describe('API Performance Budgets', () => {
  test.skip('Search API meets performance budget', async () => {
    const url = '/api/search?q=test';
    const budget = apiResponseTimes['/api/search'];

    const results = await benchmarkApi(url, 10);

    console.log(`Search API Performance:
      p50: ${results.p50.toFixed(2)}ms (budget: ${budget.p50}ms)
      p95: ${results.p95.toFixed(2)}ms (budget: ${budget.p95}ms)
      p99: ${results.p99.toFixed(2)}ms (budget: ${budget.p99}ms)
      avg: ${results.avg.toFixed(2)}ms
      min: ${results.min.toFixed(2)}ms
      max: ${results.max.toFixed(2)}ms
    `);

    expect(results.p50).toBeLessThan(budget.p50);
    expect(results.p95).toBeLessThan(budget.p95);
    expect(results.p99).toBeLessThan(budget.p99);
  }, 30000);

  test.skip('Draft mode enable API meets performance budget', async () => {
    const url = '/api/draft-mode/enable';
    const budget = apiResponseTimes['/api/draft-mode/enable'];

    const results = await benchmarkApi(url, 10);

    console.log(`Draft Mode Enable API Performance:
      p50: ${results.p50.toFixed(2)}ms (budget: ${budget.p50}ms)
      p95: ${results.p95.toFixed(2)}ms (budget: ${budget.p95}ms)
      p99: ${results.p99.toFixed(2)}ms (budget: ${budget.p99}ms)
    `);

    expect(results.p50).toBeLessThan(budget.p50);
    expect(results.p95).toBeLessThan(budget.p95);
    expect(results.p99).toBeLessThan(budget.p99);
  }, 30000);

  test.skip('Draft mode disable API meets performance budget', async () => {
    const url = '/api/draft-mode/disable';
    const budget = apiResponseTimes['/api/draft-mode/disable'];

    const results = await benchmarkApi(url, 10);

    console.log(`Draft Mode Disable API Performance:
      p50: ${results.p50.toFixed(2)}ms (budget: ${budget.p50}ms)
      p95: ${results.p95.toFixed(2)}ms (budget: ${budget.p95}ms)
      p99: ${results.p99.toFixed(2)}ms (budget: ${budget.p99}ms)
    `);

    expect(results.p50).toBeLessThan(budget.p50);
    expect(results.p95).toBeLessThan(budget.p95);
    expect(results.p99).toBeLessThan(budget.p99);
  }, 30000);
});

describe('API Response Time Monitoring', () => {
  test('Search API responds within reasonable time', async () => {
    const time = await measureResponseTime('/api/search?q=test');

    // Very relaxed threshold for basic sanity check
    expect(time).toBeLessThan(5000); // 5 seconds
  });
});
