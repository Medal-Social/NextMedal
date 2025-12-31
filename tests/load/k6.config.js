/**
 * k6 Configuration - Shared thresholds and options
 *
 * Import these in your test scripts for consistent configurations.
 */

export const defaultThresholds = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
};

export const stressTestOptions = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export const soakTestOptions = {
  stages: [
    { duration: '2m', target: 30 },
    { duration: '30m', target: 30 },
    { duration: '2m', target: 0 },
  ],
};

export const spikeTestOptions = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '10s', target: 200 }, // Spike!
    { duration: '30s', target: 10 },
    { duration: '30s', target: 0 },
  ],
};
