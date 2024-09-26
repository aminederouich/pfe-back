module.exports = {
	testEnvironment: 'node', // Use 'node' for Node.js environment
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js$', // Define the test file pattern
	collectCoverage: false, // Enable code coverage collection
	coveragePathIgnorePatterns: ['/node_modules/'], // Ignore specific paths in code coverage
	// Add any other Jest configurations you need
}
