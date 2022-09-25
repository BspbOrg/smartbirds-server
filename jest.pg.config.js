// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  runner: 'jest-runner',
  setupFilesAfterEnv: [
    './__test_utils__/matchers.js'
  ],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  testEnvironment: './__utils__/jest-environment-ah',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test',
    process.env.DB_SCHEMA === 'y' ? null : '<rootDir>/__tests__/db-schema.js'
  ].filter(Boolean)
}
