// File: jest.config.js
// Generated: 2025-10-16 15:04:14 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_9dg69g3m2y1l

module.exports = {
  // Use Node.js environment for Express/MongoDB compatibility
  testEnvironment: 'node',

  // Use MongoDB Memory Server preset for in-memory database testing
  preset: '@shelf/jest-mongodb',

  // Test timeout for async database operations
  testTimeout: 10000,

  // Verbose output for detailed test results
  verbose: true,

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],

  // Coverage collection patterns
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // Coverage output directory
  coverageDirectory: 'coverage',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Maximum number of workers
  maxWorkers: '50%',

  // Module directories
  moduleDirectories: [
    'node_modules',
    'src'
  ],

  // Setup files after environment
  setupFilesAfterEnv: [],

  // Transform files
  transform: {},

  // Module file extensions
  moduleFileExtensions: [
    'js',
    'json'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Watch ignore patterns
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ]
};
