module.exports = {
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js$',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: false,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 15000,
  forceExit: true,
  detectOpenHandles: false,
  maxWorkers: 1,
};
