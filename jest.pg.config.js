// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  runner: 'jest-runner',
  setupFilesAfterEnv: [
    './__test_utils__/matchers.js'
  ],
  testEnvironment: 'ah',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test'
  ]
}
