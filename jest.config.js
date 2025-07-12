module.exports = {
  testEnvironment: 'node', // Use 'node' for Node.js environment
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js$', // Define the test file pattern
  collectCoverage: false, // Enable code coverage collection
  coveragePathIgnorePatterns: ['/node_modules/'], // Ignore specific paths in code coverage
  verbose: true, // Display individual test results
  clearMocks: true, // Clear mocks between tests
  resetMocks: true, // Reset mocks between tests
  restoreMocks: true, // Restore mocks after tests
  testTimeout: 10000, // Set test timeout to 10 seconds
  // Add any other Jest configurations you need
};
