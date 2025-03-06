module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
  ],
  moduleNameMapper: {
    // Mock the @swa_llow/pricing_engine for tests
    '@swa_llow/pricing_engine': '<rootDir>/test/mocks/pricingEngineMock.ts'
  },
};