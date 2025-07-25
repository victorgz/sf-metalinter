import Linter from '../../../src/objects/Linter.js';
import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

describe('Linter', () => {
  let linter;
  let mockRules;
  let mockFile;

  beforeEach(() => {
    // Create mock rules
    mockRules = [
      {
        name: 'test-rule-1',
        run: jest.fn().mockResolvedValue(undefined),
      },
      {
        name: 'test-rule-2',
        run: jest.fn().mockResolvedValue(undefined),
      },
    ];

    // Create mock file
    mockFile = {
      path: '/test/path/file.object-meta.xml',
      content: '<xml>test content</xml>',
    };

    linter = new Linter(mockRules);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a linter with rules', () => {
      expect(linter.rules).toBe(mockRules);
      expect(linter.rules).toHaveLength(2);
    });

    it('should handle empty rules array', () => {
      const emptyLinter = new Linter([]);
      expect(emptyLinter.rules).toEqual([]);
      expect(emptyLinter.rules).toHaveLength(0);
    });

    it('should handle null rules', () => {
      const nullLinter = new Linter(null);
      expect(nullLinter.rules).toBeNull();
    });

    it('should handle undefined rules', () => {
      const undefinedLinter = new Linter(undefined);
      expect(undefinedLinter.rules).toBeUndefined();
    });

    it('should store reference to original rules array', () => {
      const originalRules = mockRules;
      const testLinter = new Linter(originalRules);
      expect(testLinter.rules).toBe(originalRules);
    });
  });

  describe('runOnFile', () => {
    it('should run all rules on a file', async () => {
      const result = await linter.runOnFile(mockFile);

      expect(mockRules[0].run).toHaveBeenCalledWith(mockFile, expect.any(Function));
      expect(mockRules[1].run).toHaveBeenCalledWith(mockFile, expect.any(Function));
      expect(result).toEqual([]);
    });

    it('should collect messages from rules', async () => {
      // Mock rules to report messages
      mockRules[0].run.mockImplementation(async (file, report) => {
        report({
          rule: 'test-rule-1',
          message: 'Test message 1',
          filePath: file.path,
          line: 1,
        });
      });

      mockRules[1].run.mockImplementation(async (file, report) => {
        report({
          rule: 'test-rule-2',
          message: 'Test message 2',
          filePath: file.path,
          line: 2,
        });
      });

      const result = await linter.runOnFile(mockFile);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        rule: 'test-rule-1',
        message: 'Test message 1',
        filePath: '/test/path/file.object-meta.xml',
        line: 1,
      });
      expect(result[1]).toEqual({
        rule: 'test-rule-2',
        message: 'Test message 2',
        filePath: '/test/path/file.object-meta.xml',
        line: 2,
      });
    });

    it('should handle rules that do not report messages', async () => {
      const result = await linter.runOnFile(mockFile);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle async rules correctly', async () => {
      mockRules[0].run.mockImplementation(async (file, report) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        report({ message: 'Async message', rule: 'async-rule', filePath: file.path, line: 0 });
      });

      const result = await linter.runOnFile(mockFile);
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe('Async message');
    });

    it('should pass correct report function to each rule', async () => {
      let capturedReportFunctions = [];

      mockRules[0].run.mockImplementation(async (file, report) => {
        capturedReportFunctions.push(report);
      });

      mockRules[1].run.mockImplementation(async (file, report) => {
        capturedReportFunctions.push(report);
      });

      await linter.runOnFile(mockFile);

      expect(capturedReportFunctions).toHaveLength(2);
      expect(typeof capturedReportFunctions[0]).toBe('function');
      expect(typeof capturedReportFunctions[1]).toBe('function');
    });

    it('should collect multiple messages from single rule', async () => {
      mockRules[0].run.mockImplementation(async (file, report) => {
        report({ message: 'First message', rule: 'test', filePath: file.path, line: 1 });
        report({ message: 'Second message', rule: 'test', filePath: file.path, line: 2 });
      });

      const result = await linter.runOnFile(mockFile);

      expect(result).toHaveLength(2);
      expect(result[0].message).toBe('First message');
      expect(result[1].message).toBe('Second message');
    });

    it('should handle rules throwing errors', async () => {
      mockRules[0].run.mockRejectedValue(new Error('Rule execution failed'));

      await expect(linter.runOnFile(mockFile)).rejects.toThrow('Rule execution failed');
    });

    it('should run rules sequentially and await each one', async () => {
      const executionOrder = [];

      mockRules[0].run.mockImplementation(async (file, report) => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        executionOrder.push('rule-1');
      });

      mockRules[1].run.mockImplementation(async (file, report) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push('rule-2');
      });

      await linter.runOnFile(mockFile);

      expect(executionOrder).toEqual(['rule-1', 'rule-2']);
    });

    it('should handle empty rules array', async () => {
      const emptyLinter = new Linter([]);
      const result = await emptyLinter.runOnFile(mockFile);

      expect(result).toEqual([]);
    });

    it('should maintain message order from rules execution', async () => {
      mockRules[0].run.mockImplementation(async (file, report) => {
        report({ message: 'Rule 1 - Message 1', rule: 'rule1', filePath: file.path, line: 1 });
        report({ message: 'Rule 1 - Message 2', rule: 'rule1', filePath: file.path, line: 2 });
      });

      mockRules[1].run.mockImplementation(async (file, report) => {
        report({ message: 'Rule 2 - Message 1', rule: 'rule2', filePath: file.path, line: 3 });
      });

      const result = await linter.runOnFile(mockFile);

      expect(result).toHaveLength(3);
      expect(result[0].message).toBe('Rule 1 - Message 1');
      expect(result[1].message).toBe('Rule 1 - Message 2');
      expect(result[2].message).toBe('Rule 2 - Message 1');
    });

    it('should pass the same file object to all rules', async () => {
      let passedFiles = [];

      mockRules[0].run.mockImplementation(async (file) => {
        passedFiles.push(file);
      });

      mockRules[1].run.mockImplementation(async (file) => {
        passedFiles.push(file);
      });

      await linter.runOnFile(mockFile);

      expect(passedFiles[0]).toBe(mockFile);
      expect(passedFiles[1]).toBe(mockFile);
      expect(passedFiles[0]).toBe(passedFiles[1]);
    });

    it('should handle complex message structures', async () => {
      mockRules[0].run.mockImplementation(async (file, report) => {
        report({
          rule: 'complex-rule',
          priority: 'error',
          message: 'Complex error message',
          filePath: file.path,
          line: 42,
          column: 15,
          severity: 'high',
          metadata: { customField: 'customValue' },
        });
      });

      const result = await linter.runOnFile(mockFile);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        rule: 'complex-rule',
        priority: 'error',
        message: 'Complex error message',
        filePath: '/test/path/file.object-meta.xml',
        line: 42,
        column: 15,
        severity: 'high',
        metadata: { customField: 'customValue' },
      });
    });
  });
});
