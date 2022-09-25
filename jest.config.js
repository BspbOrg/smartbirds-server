// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Allows you to use a custom runner instead of Jest's default test runner
  runner: 'jest-runner-mocha',

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['./test/transformGlobals.js'],

  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/test/**/*.[jt]s?(x)'
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test/fixtures',
    '<rootDir>/test/_setup.js',
    '<rootDir>/test/helpers/generators.js',
    '<rootDir>/test/transformGlobals.js'
  ]
}
