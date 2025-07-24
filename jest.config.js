export default {
  // ES modules support
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {},
  
  // Jest globals injection
  injectGlobals: true,
  
  // Test projects for better organization
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['**/test/unit/**/*.test.js'],
      coverageDirectory: 'coverage/unit',
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
      },
      transform: {},
      injectGlobals: true
    },
    {
      displayName: 'integration',
      testEnvironment: 'node', 
      testMatch: ['**/test/integration/**/*.test.js'],
      coverageDirectory: 'coverage/integration',
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
      },
      transform: {},
      injectGlobals: true
    }
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/test/',
    '/bin/'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true
}; 