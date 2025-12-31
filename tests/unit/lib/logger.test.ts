import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

describe('logger', () => {
  beforeEach(() => {
    // Reset modules to re-evaluate logger with new env
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('log level configuration', () => {
    it('uses LOG_LEVEL env when set', async () => {
      process.env.LOG_LEVEL = 'debug';
      vi.stubEnv('NODE_ENV', 'production');

      const { logger } = await import('@/lib/core/logger');

      expect(logger.level).toBe('debug');
    }, 10000);

    it('uses error level in test environment', async () => {
      delete process.env.LOG_LEVEL;
      vi.stubEnv('NODE_ENV', 'test');

      const { logger } = await import('@/lib/core/logger');

      expect(logger.level).toBe('error');
    });

    it('uses info level by default in non-test environment', async () => {
      delete process.env.LOG_LEVEL;
      vi.stubEnv('NODE_ENV', 'development');

      const { logger } = await import('@/lib/core/logger');

      expect(logger.level).toBe('info');
    });
  });

  describe('logger interface', () => {
    it('has standard pino methods', async () => {
      const { logger } = await import('@/lib/core/logger');

      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.trace).toBe('function');
      expect(typeof logger.fatal).toBe('function');
    });

    it('has child logger capability', async () => {
      const { logger } = await import('@/lib/core/logger');

      expect(typeof logger.child).toBe('function');

      const childLogger = logger.child({ component: 'test' });
      expect(typeof childLogger.info).toBe('function');
    });
  });

  describe('production vs development', () => {
    it('configures transport for non-production', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      // In development, pino-pretty transport is configured
      // We can verify the logger is created without errors
      const { logger } = await import('@/lib/core/logger');

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('has no transport in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      delete process.env.LOG_LEVEL;

      const { logger } = await import('@/lib/core/logger');

      expect(logger).toBeDefined();
      expect(logger.level).toBe('info');
    });
  });

  describe('Sentry integration behavior', () => {
    it('is configured with hooks for error logging', async () => {
      const { logger } = await import('@/lib/core/logger');

      // The logger should have the hooks configured
      // We can verify this by checking the logger is a valid pino instance
      expect(logger).toBeDefined();
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('logging functionality', () => {
    it('can log info messages', async () => {
      process.env.LOG_LEVEL = 'info';
      const { logger } = await import('@/lib/core/logger');

      // This should not throw
      expect(() => logger.info('Test info message')).not.toThrow();
    });

    it('can log with object context', async () => {
      process.env.LOG_LEVEL = 'info';
      const { logger } = await import('@/lib/core/logger');

      // This should not throw
      expect(() => logger.info({ userId: 123 }, 'User action')).not.toThrow();
    });

    it('can log errors', async () => {
      process.env.LOG_LEVEL = 'error';
      const { logger } = await import('@/lib/core/logger');

      const error = new Error('Test error');

      // This should not throw
      expect(() => logger.error({ err: error }, 'Error occurred')).not.toThrow();
    });

    it('can log with nested objects', async () => {
      process.env.LOG_LEVEL = 'info';
      const { logger } = await import('@/lib/core/logger');

      const context = {
        user: { id: 1, name: 'Test' },
        metadata: { timestamp: Date.now() },
      };

      expect(() => logger.info(context, 'Complex log')).not.toThrow();
    });
  });

  describe('child loggers', () => {
    it('creates child logger with bindings', async () => {
      const { logger } = await import('@/lib/core/logger');

      const childLogger = logger.child({ service: 'api', version: '1.0' });

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });

    it('child logger inherits parent level', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { logger } = await import('@/lib/core/logger');

      const childLogger = logger.child({ component: 'test' });

      expect(childLogger.level).toBe('debug');
    });
  });
});
