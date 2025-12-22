/**
 * Test Setup - Configuration globale pour tous les tests
 */

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.FIREBASE_PROJECT_ID = 'test-project-id';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global mocks
global.console = {
  ...console,
  error: jest.fn(), // Mock console.error pour éviter les logs pendant les tests
  warn: jest.fn(),
  log: jest.fn(),
};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
