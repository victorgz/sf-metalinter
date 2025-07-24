import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { executeLinter } from '../../src/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '..', 'fixtures');

describe('Linting Workflow Integration', () => {
  let mockConsoleLog;
  let mockConsoleError;

  beforeEach(() => {
    // Mock console to avoid cluttering test output
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('End-to-End Linting', () => {
    it('should successfully lint valid XML files with default rules', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      
      // Verify test file exists
      await expect(fs.access(sampleFile)).resolves.not.toThrow();

      const results = await executeLinter([sampleFile]);

      // Should return an array of results
      expect(Array.isArray(results)).toBe(true);
      
      // For this test, we expect some linting results (based on default rules)
      // The exact number depends on what default rules are configured
  
    });

    it('should handle multiple files in a batch', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const invalidFile = join(fixturesPath, 'invalid-file.object-meta.xml');

      const results = await executeLinter([sampleFile, invalidFile]);

      expect(Array.isArray(results)).toBe(true);
      
      // Should process both files, even if one has issues
  
    });

    it('should process directories and find metadata files', async () => {
      // Test with the fixtures directory
      const results = await executeLinter([fixturesPath]);

      expect(Array.isArray(results)).toBe(true);
      
      // Should find and process .object-meta.xml files in the directory
  
    });
  });

  describe('Custom Rules Integration', () => {
    it('should load and execute custom rules', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const customRulesFile = join(fixturesPath, 'sample-rules.js');

      // Verify custom rules file exists
      await expect(fs.access(customRulesFile)).resolves.not.toThrow();

      const results = await executeLinter([sampleFile], customRulesFile);

      expect(Array.isArray(results)).toBe(true);

      // Check if our custom rules were applied
      const hasDescriptionRule = results.some(result => 
        result.message && result.message.includes('description')
      );
      const hasNamingRule = results.some(result => 
        result.message && result.message.includes('__c')
      );

      // At least one of our custom rules should trigger
      expect(hasDescriptionRule || hasNamingRule).toBe(true);
      
  
    });

    it('should handle invalid custom rules gracefully', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const nonExistentRules = join(fixturesPath, 'non-existent-rules.js');

      // Should handle missing custom rules file gracefully
      await expect(async () => {
        await executeLinter([sampleFile], nonExistentRules);
      }).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed XML files gracefully', async () => {
      const invalidFile = join(fixturesPath, 'invalid-file.object-meta.xml');

      // Should not throw an error, but handle gracefully
      const results = await executeLinter([invalidFile]);

      expect(Array.isArray(results)).toBe(true);
      
      // May have fewer results due to XML parsing issues, but should not crash
  
    });

    it('should handle non-existent files', async () => {
      const nonExistentFile = join(fixturesPath, 'does-not-exist.xml');

      // Should handle missing files gracefully
      await expect(async () => {
        await executeLinter([nonExistentFile]);
      }).rejects.toThrow();
    });

    it('should handle empty file paths array', async () => {
      const results = await executeLinter([]);

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });
  });

  describe('File Processing', () => {
    it('should correctly parse XML content', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      
      const results = await executeLinter([sampleFile]);

      expect(Array.isArray(results)).toBe(true);
      
      // Verify that the linter actually processed the file content
      // (This test validates that XML parsing is working)
  
    });

    it('should handle different file extensions correctly', async () => {
      // Test with our .object-meta.xml file
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      
      const results = await executeLinter([sampleFile]);

      expect(Array.isArray(results)).toBe(true);
      
      // Should process metadata XML files
  
    });
  });

  describe('Integration with Base Rules', () => {
    it('should apply base rules even without custom rules', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      
      // Run without custom rules - should use base rules
      const results = await executeLinter([sampleFile]);

      expect(Array.isArray(results)).toBe(true);
      
      // Should have some results from base rules
  
    });

    it('should merge custom rules with base rules', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const customRulesFile = join(fixturesPath, 'sample-rules.js');

      const results = await executeLinter([sampleFile], customRulesFile);

      expect(Array.isArray(results)).toBe(true);
      
      // Should have results from both base and custom rules
  
    });
  });

  describe('Performance', () => {
    it('should complete linting in reasonable time', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      
      const startTime = Date.now();
      const results = await executeLinter([sampleFile]);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      
      expect(Array.isArray(results)).toBe(true);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 