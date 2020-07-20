// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  runner: 'jest-runner',
  testEnvironment: 'ah',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test'
  ]
}
