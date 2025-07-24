import { printResults, printPlainResults, printJsonResults, printCsvResults } from '../../../src/utils/printer.js';
import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

describe('Printer', () => {
  let mockLogger;
  let sampleResults;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn()
    };

    sampleResults = [
      {
        filePath: '/path/to/file1.xml',
        line: 10,
        rule: 'test-rule-1',
        message: 'Error message 1',
        priority: 1 // ERROR
      },
      {
        filePath: '/path/to/file2.xml',
        line: 25,
        rule: 'test-rule-2',
        message: 'Warning message 2',
        priority: 2 // WARNING
      },
      {
        filePath: '/path/to/file3.xml',
        line: 5,
        rule: 'test-rule-3',
        message: 'Info message 3',
        priority: 3 // INFO
      }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('printResults', () => {
    it('should call printJsonResults for json format', () => {
      printResults(sampleResults, 'json', mockLogger);

      expect(mockLogger.log).toHaveBeenCalled();
      const loggedOutput = mockLogger.log.mock.calls[0][0];
      expect(() => JSON.parse(loggedOutput)).not.toThrow();
    });

    it('should call printCsvResults for csv format', () => {
      printResults(sampleResults, 'csv', mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('File,Line,Severity,Rule,Message');
      expect(mockLogger.log).toHaveBeenCalledTimes(4); // Header + 3 results
    });

    it('should call printPlainResults for default format', () => {
      printResults(sampleResults, 'plain', mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('[ERROR][test-rule-1] /path/to/file1.xml:10: Error message 1');
      expect(mockLogger.log).toHaveBeenCalledWith('\n📊 Summary: 3 issues found');
    });

    it('should call printPlainResults for unknown format', () => {
      printResults(sampleResults, 'unknown-format', mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('[ERROR][test-rule-1] /path/to/file1.xml:10: Error message 1');
      expect(mockLogger.log).toHaveBeenCalledWith('\n📊 Summary: 3 issues found');
    });
  });

  describe('printPlainResults', () => {
    it('should print results in plain text format', () => {
      printPlainResults(sampleResults, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('[ERROR][test-rule-1] /path/to/file1.xml:10: Error message 1');
      expect(mockLogger.log).toHaveBeenCalledWith('[WARNING][test-rule-2] /path/to/file2.xml:25: Warning message 2');
      expect(mockLogger.log).toHaveBeenCalledWith('[INFO][test-rule-3] /path/to/file3.xml:5: Info message 3');
      expect(mockLogger.log).toHaveBeenCalledWith('\n📊 Summary: 3 issues found');
    });

    it('should handle empty results', () => {
      printPlainResults([], mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('\n📊 Summary: 0 issues found');
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });

    it('should handle unknown priority values', () => {
      const resultsWithUnknownPriority = [
        {
          filePath: '/path/to/file.xml',
          line: 1,
          rule: 'test-rule',
          message: 'Test message',
          priority: 999
        }
      ];

      printPlainResults(resultsWithUnknownPriority, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('[INFO][test-rule] /path/to/file.xml:1: Test message');
    });

    it('should handle single result', () => {
      printPlainResults([sampleResults[0]], mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('[ERROR][test-rule-1] /path/to/file1.xml:10: Error message 1');
      expect(mockLogger.log).toHaveBeenCalledWith('\n📊 Summary: 1 issues found');
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('printJsonResults', () => {
    it('should print results in JSON format with summary', () => {
      printJsonResults(sampleResults, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      const loggedOutput = mockLogger.log.mock.calls[0][0];
      const parsedOutput = JSON.parse(loggedOutput);

      expect(parsedOutput).toHaveProperty('summary');
      expect(parsedOutput).toHaveProperty('issues');
      expect(parsedOutput.summary.totalIssues).toBe(3);
      expect(parsedOutput.summary.errors).toBe(1);
      expect(parsedOutput.summary.warnings).toBe(1);
      expect(parsedOutput.summary.info).toBe(1);
    });

    it('should include properly formatted issues', () => {
      printJsonResults(sampleResults, mockLogger);

      const loggedOutput = mockLogger.log.mock.calls[0][0];
      const parsedOutput = JSON.parse(loggedOutput);

      expect(parsedOutput.issues).toHaveLength(3);
      expect(parsedOutput.issues[0]).toEqual({
        file: '/path/to/file1.xml',
        line: 10,
        rule: 'test-rule-1',
        message: 'Error message 1',
        priority: 1,
        severity: 'error'
      });
      expect(parsedOutput.issues[1]).toEqual({
        file: '/path/to/file2.xml',
        line: 25,
        rule: 'test-rule-2',
        message: 'Warning message 2',
        priority: 2,
        severity: 'warning'
      });
      expect(parsedOutput.issues[2]).toEqual({
        file: '/path/to/file3.xml',
        line: 5,
        rule: 'test-rule-3',
        message: 'Info message 3',
        priority: 3,
        severity: 'info'
      });
    });

    it('should handle empty results', () => {
      printJsonResults([], mockLogger);

      const loggedOutput = mockLogger.log.mock.calls[0][0];
      const parsedOutput = JSON.parse(loggedOutput);

      expect(parsedOutput.summary.totalIssues).toBe(0);
      expect(parsedOutput.summary.errors).toBe(0);
      expect(parsedOutput.summary.warnings).toBe(0);
      expect(parsedOutput.summary.info).toBe(0);
      expect(parsedOutput.issues).toEqual([]);
    });

    it('should handle unknown priority in severity mapping', () => {
      const resultsWithUnknownPriority = [{
        filePath: '/path/to/file.xml',
        line: 1,
        rule: 'test-rule',
        message: 'Test message',
        priority: 999
      }];

      printJsonResults(resultsWithUnknownPriority, mockLogger);

      const loggedOutput = mockLogger.log.mock.calls[0][0];
      const parsedOutput = JSON.parse(loggedOutput);

      expect(parsedOutput.issues[0].severity).toBe('info');
    });

    it('should properly format JSON with indentation', () => {
      printJsonResults(sampleResults, mockLogger);

      const loggedOutput = mockLogger.log.mock.calls[0][0];
      
      // Should contain proper JSON formatting with indentation
      expect(loggedOutput).toContain('{\n  "summary"');
      expect(loggedOutput).toContain('  "totalIssues"');
    });
  });

  describe('printCsvResults', () => {
    it('should print CSV header and results', () => {
      printCsvResults(sampleResults, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('File,Line,Severity,Rule,Message');
      expect(mockLogger.log).toHaveBeenCalledWith('/path/to/file1.xml,10,ERROR,test-rule-1,Error message 1');
      expect(mockLogger.log).toHaveBeenCalledWith('/path/to/file2.xml,25,WARNING,test-rule-2,Warning message 2');
      expect(mockLogger.log).toHaveBeenCalledWith('/path/to/file3.xml,5,INFO,test-rule-3,Info message 3');
      expect(mockLogger.log).toHaveBeenCalledTimes(4);
    });

    it('should handle empty results', () => {
      printCsvResults([], mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('File,Line,Severity,Rule,Message');
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });

    it('should escape CSV fields with commas', () => {
      const resultsWithCommas = [{
        filePath: '/path/to/file,with,commas.xml',
        line: 1,
        rule: 'test,rule',
        message: 'Message with, commas',
        priority: 1
      }];

      printCsvResults(resultsWithCommas, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('File,Line,Severity,Rule,Message');
      expect(mockLogger.log).toHaveBeenCalledWith('"/path/to/file,with,commas.xml",1,ERROR,"test,rule","Message with, commas"');
    });

    it('should escape CSV fields with quotes', () => {
      const resultsWithQuotes = [{
        filePath: '/path/to/file"with"quotes.xml',
        line: 1,
        rule: 'test"rule',
        message: 'Message with "quotes"',
        priority: 2
      }];

      printCsvResults(resultsWithQuotes, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('"/path/to/file""with""quotes.xml",1,WARNING,"test""rule","Message with ""quotes"""');
    });

    it('should escape CSV fields with newlines', () => {
      const resultsWithNewlines = [{
        filePath: '/path/to/file\nwith\nnewlines.xml',
        line: 1,
        rule: 'test\nrule',
        message: 'Message with\nnewlines',
        priority: 3
      }];

      printCsvResults(resultsWithNewlines, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('"/path/to/file\nwith\nnewlines.xml",1,INFO,"test\nrule","Message with\nnewlines"');
    });

    it('should handle numeric values correctly', () => {
      const resultsWithNumbers = [{
        filePath: 123,
        line: 456,
        rule: 789,
        message: 101112,
        priority: 1
      }];

      printCsvResults(resultsWithNumbers, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('123,456,ERROR,789,101112');
    });

    it('should handle unknown priority in severity mapping', () => {
      const resultsWithUnknownPriority = [{
        filePath: '/path/to/file.xml',
        line: 1,
        rule: 'test-rule',
        message: 'Test message',
        priority: 999
      }];

      printCsvResults(resultsWithUnknownPriority, mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('/path/to/file.xml,1,INFO,test-rule,Test message');
    });

    it('should handle single result', () => {
      printCsvResults([sampleResults[0]], mockLogger);

      expect(mockLogger.log).toHaveBeenCalledWith('File,Line,Severity,Rule,Message');
      expect(mockLogger.log).toHaveBeenCalledWith('/path/to/file1.xml,10,ERROR,test-rule-1,Error message 1');
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });
  });
}); 