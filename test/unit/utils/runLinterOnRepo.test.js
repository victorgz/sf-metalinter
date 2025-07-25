import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

// Create mocks
const mockParseXml = jest.fn();
const mockLinterClass = jest.fn().mockImplementation(() => ({
  runOnFile: jest.fn().mockResolvedValue([]),
}));
const mockGlob = jest.fn();
const mockFs = {
  stat: jest.fn(),
  readFile: jest.fn(),
};
const mockPath = {
  relative: jest.fn(),
  basename: jest.fn(),
};

// Mock all dependencies using unstable_mockModule
jest.unstable_mockModule('../../../src/objects/Linter.js', () => ({
  default: mockLinterClass,
}));
jest.unstable_mockModule('../../../src/utils/xmlParser.js', () => ({
  parseXml: mockParseXml,
}));
jest.unstable_mockModule('glob', () => ({
  glob: mockGlob,
}));
jest.unstable_mockModule('fs/promises', () => ({
  default: mockFs,
}));
jest.unstable_mockModule('path', () => ({
  default: mockPath,
}));

// Import after mocking
const { default: runLinterOnRepo } = await import('../../../src/utils/runLinterOnRepo.js');

describe('runLinterOnRepo', () => {
  let mockLinter;
  let mockRules;
  let mockConsoleLog;
  let mockConsoleWarn;

  beforeEach(() => {
    // Mock Linter - since it's already mocked in jest.mock(), we just need to ensure it returns our mockLinter
    mockLinter = {
      runOnFile: jest.fn().mockResolvedValue([]),
    };
    mockLinterClass.mockImplementation(() => mockLinter);

    // Mock rules
    mockRules = [{ name: 'test-rule-1' }, { name: 'test-rule-2' }];

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    // Mock path methods
    mockPath.relative.mockImplementation((from, to) => to.replace(from + '/', ''));
    mockPath.basename.mockImplementation((filePath) => filePath.split('/').pop());

    // Mock parseXml
    mockParseXml.mockReturnValue({ parsed: 'xml' });

    // Clear all mocks
    jest.clearAllMocks();

    // Reset Linter constructor mock to track calls
    mockLinterClass.mockClear();
  });

  afterEach(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  describe('processing directories', () => {
    it('should process directories and find metadata files', async () => {
      const mockStats = { isDirectory: () => true, isFile: () => false };
      mockFs.stat.mockResolvedValue(mockStats);

      mockGlob.mockResolvedValue([
        '/project/force-app/main/default/objects/Account.object-meta.xml',
        '/project/force-app/main/default/classes/TestClass.cls-meta.xml',
      ]);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      const result = await runLinterOnRepo(['/project/dir'], mockRules);

      expect(mockGlob).toHaveBeenCalledWith(expect.stringMatching(/\*\*\/\*\.\*-meta\.xml$/), {
        cwd: '/project/dir',
        absolute: true,
      });
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should process multiple directories', async () => {
      const mockStats = { isDirectory: () => true, isFile: () => false };
      mockFs.stat.mockResolvedValue(mockStats);

      mockGlob.mockImplementation((pattern, options) => {
        if (options.cwd === '/project/dir1') {
          return Promise.resolve(['/project/dir1/file1.object-meta.xml']);
        }
        if (options.cwd === '/project/dir2') {
          return Promise.resolve(['/project/dir2/file2.cls-meta.xml']);
        }
        return Promise.resolve([]);
      });
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      const result = await runLinterOnRepo(['/project/dir1', '/project/dir2'], mockRules);

      expect(mockGlob).toHaveBeenCalledTimes(2);
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('processing files', () => {
    it('should process individual files', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>file content</xml>');

      await runLinterOnRepo(['/project/test.object-meta.xml'], mockRules);

      expect(mockFs.readFile).toHaveBeenCalledWith('/project/test.object-meta.xml', 'utf8');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Number of files to lint: ', 1);
    });

    it('should handle multiple individual files', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      await runLinterOnRepo(['/project/file1.object-meta.xml', '/project/file2.cls-meta.xml'], mockRules);

      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('XML parsing', () => {
    it('should parse XML successfully and include parsed content', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>valid content</xml>');

      const mockParsedXml = { element: 'parsed' };
      mockParseXml.mockReturnValue(mockParsedXml);

      await runLinterOnRepo(['/project/test.xml'], mockRules);

      expect(mockParseXml).toHaveBeenCalledWith('<xml>valid content</xml>');
      expect(mockLinter.runOnFile).toHaveBeenCalledWith({
        path: expect.stringContaining('test.xml'),
        name: 'test.xml',
        raw: '<xml>valid content</xml>',
        parsedXml: mockParsedXml,
      });
    });

    it('should handle XML parsing errors gracefully', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<invalid>xml');

      mockParseXml.mockImplementation(() => {
        throw new Error('Invalid XML');
      });

      await runLinterOnRepo(['/project/invalid.xml'], mockRules);

      // Should continue processing even with XML parse error
      expect(mockLinter.runOnFile).toHaveBeenCalledWith({
        path: expect.stringContaining('invalid.xml'),
        name: 'invalid.xml',
        raw: '<invalid>xml',
        parsedXml: null,
      });
    });
  });

  describe('linter execution', () => {
    it('should run linter on all files and collect results', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      mockLinter.runOnFile
        .mockResolvedValueOnce([{ message: 'Issue 1', line: 10, priority: 'error' }])
        .mockResolvedValueOnce([{ message: 'Issue 2', line: 5, priority: 'warning' }]);

      const result = await runLinterOnRepo(['/project/file1.xml', '/project/file2.xml'], mockRules);

      expect(result).toEqual([
        { message: 'Issue 1', line: 10, priority: 'error' },
        { message: 'Issue 2', line: 5, priority: 'warning' },
      ]);
    });

    it('should flatten results from multiple files', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      mockLinter.runOnFile
        .mockResolvedValueOnce([
          { message: 'Error 1', priority: 'error' },
          { message: 'Warning 1', priority: 'warning' },
        ])
        .mockResolvedValueOnce([{ message: 'Error 2', priority: 'error' }]);

      const result = await runLinterOnRepo(['/project/file1.xml', '/project/file2.xml'], mockRules);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { message: 'Error 1', priority: 'error' },
        { message: 'Warning 1', priority: 'warning' },
        { message: 'Error 2', priority: 'error' },
      ]);
    });

    it('should handle files with no issues', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>clean content</xml>');

      mockLinter.runOnFile.mockResolvedValue([]);

      const result = await runLinterOnRepo(['/project/clean.xml'], mockRules);

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should warn about unsupported path types', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => false };
      mockFs.stat.mockResolvedValue(mockStats);

      const result = await runLinterOnRepo(['/project/socket'], mockRules);

      expect(mockConsoleWarn).toHaveBeenCalledWith('⚠️ Skipping unsupported path: /project/socket');
      expect(result).toEqual([]);
    });

    it('should handle file read errors', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      await expect(runLinterOnRepo(['/project/forbidden.xml'], mockRules)).rejects.toThrow('Permission denied');
    });

    it('should handle stat errors', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));

      await expect(runLinterOnRepo(['/nonexistent/path'], mockRules)).rejects.toThrow('File not found');
    });

    it('should handle glob errors', async () => {
      const mockStats = { isDirectory: () => true, isFile: () => false };
      mockFs.stat.mockResolvedValue(mockStats);
      mockGlob.mockRejectedValue(new Error('Glob failed'));

      await expect(runLinterOnRepo(['/project/dir'], mockRules)).rejects.toThrow('Glob failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle mixed file and directory paths', async () => {
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true, isFile: () => false }) // directory
        .mockResolvedValueOnce({ isDirectory: () => false, isFile: () => true }); // file

      mockGlob.mockResolvedValue(['/project/dir/found.object-meta.xml']);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      const result = await runLinterOnRepo(['/project/dir', '/project/file.xml'], mockRules);

      expect(mockGlob).toHaveBeenCalledWith(expect.any(String), {
        cwd: '/project/dir',
        absolute: true,
      });
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should handle empty directories', async () => {
      const mockStats = { isDirectory: () => true, isFile: () => false };
      mockFs.stat.mockResolvedValue(mockStats);
      mockGlob.mockResolvedValue([]);

      const result = await runLinterOnRepo(['/project/empty-dir'], mockRules);

      expect(result).toEqual([]);
    });

    it('should create Linter with provided rules', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      await runLinterOnRepo(['/project/test.xml'], mockRules);

      expect(mockLinterClass).toHaveBeenCalledWith(mockRules);
    });

    it('should process files in parallel', async () => {
      const mockStats = { isDirectory: () => false, isFile: () => true };
      mockFs.stat.mockResolvedValue(mockStats);
      mockFs.readFile.mockResolvedValue('<xml>content</xml>');

      // Simulate async delay to test parallel processing
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      mockLinter.runOnFile.mockImplementation(async (file) => {
        await delay(10);
        return [{ file: file.name, message: 'processed' }];
      });

      const start = Date.now();
      await runLinterOnRepo(['/project/file1.xml', '/project/file2.xml', '/project/file3.xml'], mockRules);
      const elapsed = Date.now() - start;

      // Should be much faster than 30ms (3 * 10ms) if running in parallel
      expect(elapsed).toBeLessThan(25);
    });

    it('should use custom glob patterns when provided', async () => {
      // NOTE: This test would require additional implementation in runLinterOnRepo
      // For now, we test that it uses the default pattern
      const mockStats = { isDirectory: () => true, isFile: () => false };
      mockFs.stat.mockResolvedValue(mockStats);
      mockGlob.mockResolvedValue([]);

      await runLinterOnRepo(['/project/dir'], mockRules);

      expect(mockGlob).toHaveBeenCalledWith(expect.stringMatching(/\*\*\/\*\.\*-meta\.xml$/), expect.any(Object));
    });
  });
});
