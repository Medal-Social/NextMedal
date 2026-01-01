/**
 * Lighthouse Score Thresholds Configuration
 *
 * Scores range from 0-100:
 * - 90-100: Good (green)
 * - 50-89:  Needs improvement (orange)
 * - 0-49:   Poor (red)
 *
 * @see https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
 */

export interface LighthouseThresholds {
  performance: number;
  accessibility: number;
  'best-practices': number;
  seo: number;
}

/**
 * Default thresholds for all pages
 * These are the minimum acceptable scores for the site
 */
export const defaultThresholds: LighthouseThresholds = {
  performance: 90,
  accessibility: 100,
  'best-practices': 100,
  seo: 100,
};

/**
 * Strict thresholds for critical pages (homepage, landing pages)
 */
export const strictThresholds: LighthouseThresholds = {
  performance: 90,
  accessibility: 100,
  'best-practices': 100,
  seo: 100,
};

/**
 * Relaxed thresholds for complex/dynamic pages
 * Use sparingly and document why these pages need relaxed scores
 */
export const relaxedThresholds: LighthouseThresholds = {
  performance: 60,
  accessibility: 85,
  'best-practices': 80,
  seo: 85,
};

/**
 * Page-specific threshold overrides
 * Keys are URL paths (without locale prefix)
 */
export const pageThresholds: Record<string, Partial<LighthouseThresholds>> = {
  // Homepage should have strict thresholds
  '/': strictThresholds,

  // Add page-specific overrides here as needed
  // '/articles': { performance: 70 }, // Articles page has many images
};

/**
 * Get thresholds for a specific page
 * Falls back to default thresholds if no override exists
 */
export function getThresholdsForPage(path: string): LighthouseThresholds {
  const pageOverride = pageThresholds[path];

  if (pageOverride) {
    return {
      ...defaultThresholds,
      ...pageOverride,
    };
  }

  return defaultThresholds;
}

/**
 * Lighthouse configuration options
 */
export const lighthouseConfig = {
  // Port for Chrome DevTools Protocol
  port: 9222,

  // Lighthouse settings
  settings: {
    // Emulate mobile device
    formFactor: 'desktop' as const,

    // Throttling settings (simulate slower network)
    throttlingMethod: 'simulate' as const,

    // Skip certain audits if needed
    skipAudits: [] as string[],

    // Only run specific categories
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] as const,
  },

  // Desktop configuration
  desktop: {
    formFactor: 'desktop' as const,
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
  },

  // Mobile configuration
  mobile: {
    formFactor: 'mobile' as const,
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
  },
};

/**
 * Format Lighthouse results for reporting
 */
export function formatResults(
  results: Record<string, number>,
  thresholds: LighthouseThresholds
): string {
  const lines: string[] = ['Lighthouse Audit Results:', ''];

  for (const [category, score] of Object.entries(results)) {
    const threshold = thresholds[category as keyof LighthouseThresholds];
    const passed = score >= threshold;
    const status = passed ? '✓' : '✗';

    lines.push(`${status} ${category}: ${score} (threshold: ${threshold})`);
  }

  return lines.join('\n');
}
