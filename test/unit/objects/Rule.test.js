import Rule from '../../../src/objects/Rule.js';
import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

describe('Rule', () => {
  let mockLinter;
  let mockFile;
  let mockParentReport;

  beforeEach(() => {
    mockLinter = jest.fn().mockResolvedValue(undefined);
    mockFile = {
      path: '/test/path/Component__c.object-meta.xml',
      content: '<xml>test content</xml>'
    };
    mockParentReport = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a rule with required properties', () => {
      const definition = {
        priority: 'error',
        linter: mockLinter
      };
      
      const rule = new Rule('test-rule', definition);
      
      expect(rule.name).toBe('test-rule');
      expect(rule.priority).toBe('error');
      expect(rule.linter).toBe(mockLinter);
    });

    it('should use default include pattern for metadata files', () => {
      const definition = {
        priority: 'warning',
        linter: mockLinter
      };
      
      const rule = new Rule('test-rule', definition);
      
      expect(rule.include).toEqual(['**/*.*-meta.xml']);
    });

    it('should use default empty exclude pattern', () => {
      const definition = {
        priority: 'info',
        linter: mockLinter
      };
      
      const rule = new Rule('test-rule', definition);
      
      expect(rule.exclude).toEqual([]);
    });

    it('should accept custom include and exclude patterns', () => {
      const definition = {
        priority: 'error',
        linter: mockLinter,
        include: ['**/*.cls', '**/*.trigger'],
        exclude: ['**/test/**', '**/tests/**']
      };
      
      const rule = new Rule('test-rule', definition);
      
      expect(rule.include).toEqual(['**/*.cls', '**/*.trigger']);
      expect(rule.exclude).toEqual(['**/test/**', '**/tests/**']);
    });

    it('should handle missing priority', () => {
      const definition = {
        linter: mockLinter
      };
      
      const rule = new Rule('test-rule', definition);
      
      expect(rule.priority).toBeUndefined();
    });
  });

  describe('run', () => {
    it('should run linter on included files', async () => {
      const definition = {
        priority: 'error',
        linter: mockLinter,
        include: ['**/*-meta.xml']
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockLinter).toHaveBeenCalledWith({
        file: mockFile,
        report: expect.any(Function)
      });
    });

    it('should not run linter on excluded files', async () => {
      const definition = {
        priority: 'error', 
        linter: mockLinter,
        include: ['**/*-meta.xml'],
        exclude: ['**/Component__c.object-meta.xml']
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockLinter).not.toHaveBeenCalled();
    });

    it('should not run linter on files not matching include pattern', async () => {
      const definition = {
        priority: 'error',
        linter: mockLinter,
        include: ['**/*.cls']
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockLinter).not.toHaveBeenCalled();
    });

    it('should provide correct report function to linter', async () => {
      const testLinter = jest.fn().mockImplementation(({ report }) => {
        report('Test message', 5);
      });
      
      const definition = {
        priority: 'warning',
        linter: testLinter
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockParentReport).toHaveBeenCalledWith({
        rule: 'test-rule',
        priority: 'warning',
        message: 'Test message',
        filePath: mockFile.path,
        line: 5
      });
    });

    it('should default line number to 0 when not provided', async () => {
      const testLinter = jest.fn().mockImplementation(({ report }) => {
        report('Test message without line');
      });
      
      const definition = {
        priority: 'info',
        linter: testLinter
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockParentReport).toHaveBeenCalledWith({
        rule: 'test-rule',
        priority: 'info',
        message: 'Test message without line',
        filePath: mockFile.path,
        line: 0
      });
    });

    it('should handle async linters', async () => {
      const asyncLinter = jest.fn().mockImplementation(async ({ report }) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        report('Async message', 3);
      });
      
      const definition = {
        priority: 'error',
        linter: asyncLinter
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockParentReport).toHaveBeenCalledWith({
        rule: 'test-rule',
        priority: 'error',
        message: 'Async message',
        filePath: mockFile.path,
        line: 3
      });
    });

    it('should handle multiple include patterns', async () => {
      const definition = {
        priority: 'warning',
        linter: mockLinter,
        include: ['**/*.cls', '**/*-meta.xml', '**/*.trigger']
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(mockLinter).toHaveBeenCalled();
    });

    it('should handle multiple exclude patterns', async () => {
      const excludedFile = {
        path: '/test/excluded/Component__c.object-meta.xml',
        content: '<xml>test</xml>'
      };
      
      const definition = {
        priority: 'error',
        linter: mockLinter,
        include: ['**/*-meta.xml'],
        exclude: ['**/excluded/**', '**/temp/**']
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(excludedFile, mockParentReport);
      
      expect(mockLinter).not.toHaveBeenCalled();
    });

    it('should match complex glob patterns correctly', async () => {
      const testFiles = [
        { path: '/src/objects/Account.object-meta.xml', shouldMatch: true },
        { path: '/src/classes/TestClass.cls-meta.xml', shouldMatch: true },
        { path: '/src/flows/TestFlow.flow-meta.xml', shouldMatch: true },
        { path: '/src/objects/Account.object', shouldMatch: false },
        { path: '/src/classes/TestClass.cls', shouldMatch: false }
      ];

      const definition = {
        priority: 'error',
        linter: mockLinter,
        include: ['**/*-meta.xml']
      };
      
      const rule = new Rule('test-rule', definition);

      for (const file of testFiles) {
        mockLinter.mockClear();
        await rule.run(file, mockParentReport);
        
        if (file.shouldMatch) {
          expect(mockLinter).toHaveBeenCalled();
        } else {
          expect(mockLinter).not.toHaveBeenCalled();
        }
      }
    });

    it('should handle linter throwing errors', async () => {
      const errorLinter = jest.fn().mockRejectedValue(new Error('Linter error'));
      
      const definition = {
        priority: 'error',
        linter: errorLinter
      };
      
      const rule = new Rule('test-rule', definition);
      
      await expect(rule.run(mockFile, mockParentReport)).rejects.toThrow('Linter error');
    });

    it('should pass file object correctly to linter', async () => {
      const testLinter = jest.fn();
      const definition = {
        priority: 'error',
        linter: testLinter
      };
      
      const rule = new Rule('test-rule', definition);
      await rule.run(mockFile, mockParentReport);
      
      expect(testLinter).toHaveBeenCalledWith({
        file: mockFile,
        report: expect.any(Function)
      });
      
      const callArgs = testLinter.mock.calls[0][0];
      expect(callArgs.file).toBe(mockFile);
      expect(typeof callArgs.report).toBe('function');
    });
  });
}); 