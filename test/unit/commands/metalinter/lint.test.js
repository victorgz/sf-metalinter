import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

// Mock dependencies
const mockExecuteLinter = jest.fn();
const mockPrintResults = jest.fn();

// Mock the modules
jest.unstable_mockModule('../../../../src/index.js', () => ({
  executeLinter: mockExecuteLinter,
}));

jest.unstable_mockModule('../../../../src/utils/printer.js', () => ({
  printResults: mockPrintResults,
}));

// Import after mocking
const { default: MetalinterLint } = await import('../../../../src/commands/metalinter/lint.js');

describe('MetalinterLint Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shouldExitWithError method', () => {
    // Test the shouldExitWithError method directly without instantiating the command
    it('should return true when error severity threshold is met', () => {
      const results = [
        { priority: 1, message: 'Error issue' },
        { priority: 2, message: 'Warning issue' },
      ];

      const shouldExit = MetalinterLint.prototype.shouldExitWithError(results, 'error');
      expect(shouldExit).toBe(true);
    });

    it('should return true when warning severity threshold is met', () => {
      const results = [
        { priority: 2, message: 'Warning issue' },
        { priority: 3, message: 'Info issue' },
      ];

      const shouldExit = MetalinterLint.prototype.shouldExitWithError(results, 'warning');
      expect(shouldExit).toBe(true);
    });

    it('should return true when info severity threshold is met', () => {
      const results = [{ priority: 3, message: 'Info issue' }];

      const shouldExit = MetalinterLint.prototype.shouldExitWithError(results, 'info');
      expect(shouldExit).toBe(true);
    });

    it('should return false when severity threshold is not met', () => {
      const results = [
        { priority: 2, message: 'Warning issue' },
        { priority: 3, message: 'Info issue' },
      ];

      const shouldExit = MetalinterLint.prototype.shouldExitWithError(results, 'error');
      expect(shouldExit).toBe(false);
    });

    it('should return false for none severity threshold', () => {
      const results = [
        { priority: 1, message: 'Error issue' },
        { priority: 2, message: 'Warning issue' },
        { priority: 3, message: 'Info issue' },
      ];

      const shouldExit = MetalinterLint.prototype.shouldExitWithError(results, 'none');
      expect(shouldExit).toBe(false);
    });

    it('should handle empty results array', () => {
      const shouldExit = MetalinterLint.prototype.shouldExitWithError([], 'error');
      expect(shouldExit).toBe(false);
    });

    it('should handle mixed priority levels', () => {
      const results = [
        { priority: 3, message: 'Info issue' },
        { priority: 1, message: 'Error issue' },
        { priority: 2, message: 'Warning issue' },
      ];

      const shouldExitError = MetalinterLint.prototype.shouldExitWithError(results, 'error');
      const shouldExitWarning = MetalinterLint.prototype.shouldExitWithError(results, 'warning');
      const shouldExitInfo = MetalinterLint.prototype.shouldExitWithError(results, 'info');

      expect(shouldExitError).toBe(true);
      expect(shouldExitWarning).toBe(true);
      expect(shouldExitInfo).toBe(true);
    });

    it('should handle edge case priority values', () => {
      const results = [{ priority: 1, message: 'Error priority 1' }];

      // Test boundary conditions
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'error')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'warning')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'info')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'none')).toBe(false);
    });
  });

  describe('command configuration', () => {
    it('should have correct static properties', () => {
      expect(MetalinterLint.summary).toBe('Lint Salesforce metadata files');
      expect(MetalinterLint.description).toBe(
        'Analyze Salesforce metadata files for potential issues and best practices violations.'
      );
      expect(Array.isArray(MetalinterLint.examples)).toBe(true);
      expect(MetalinterLint.examples.length).toBeGreaterThan(0);
    });

    it('should have correct flag definitions', () => {
      expect(MetalinterLint.flags).toHaveProperty('path');
      expect(MetalinterLint.flags).toHaveProperty('rules');
      expect(MetalinterLint.flags).toHaveProperty('format');
      expect(MetalinterLint.flags).toHaveProperty('severity');

      expect(MetalinterLint.flags.path.default).toBe('force-app');
      expect(MetalinterLint.flags.severity.default).toBe('none');
      expect(MetalinterLint.flags.format.options).toEqual(['json', 'csv']);
      expect(MetalinterLint.flags.severity.options).toEqual(['error', 'warning', 'info', 'none']);
    });

    it('should have run method defined', () => {
      expect(typeof MetalinterLint.prototype.run).toBe('function');
    });

    it('should have shouldExitWithError method defined', () => {
      expect(typeof MetalinterLint.prototype.shouldExitWithError).toBe('function');
    });
  });

  describe('severity level mapping', () => {
    it('should have correct severity level hierarchy', () => {
      const results = [{ priority: 1, message: 'test' }];

      // Error (priority 1) should trigger exit for all severities except none
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'error')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'warning')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'info')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'none')).toBe(false);
    });

    it('should respect warning threshold', () => {
      const results = [{ priority: 2, message: 'test' }];

      // Warning (priority 2) should trigger exit for warning and info, but not error
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'error')).toBe(false);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'warning')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'info')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'none')).toBe(false);
    });

    it('should respect info threshold', () => {
      const results = [{ priority: 3, message: 'test' }];

      // Info (priority 3) should only trigger exit for info threshold
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'error')).toBe(false);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'warning')).toBe(false);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'info')).toBe(true);
      expect(MetalinterLint.prototype.shouldExitWithError(results, 'none')).toBe(false);
    });
  });
});
