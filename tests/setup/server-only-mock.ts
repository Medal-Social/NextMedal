/**
 * Mock for server-only package in tests
 * The actual server-only package throws an error if imported in client code.
 * In tests, we need to mock it to allow importing server-side modules.
 */

// Export nothing - just a placeholder to allow imports
export {};
