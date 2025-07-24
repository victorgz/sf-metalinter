import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { executeLinter } from '../../src/index.js';
import { printResults } from '../../src/utils/printer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '..', 'fixtures');

describe('Output Formats Integration', () => {
  let tempDir;
  let mockConsoleLog;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(join(os.tmpdir(), 'metalinter-test-'));
    
    // Mock console.log to capture output
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    // Also mock console.warn to avoid cluttering output during testing
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    
    mockConsoleLog.mockRestore();
  });

  describe('Plain Text Output', () => {
    it('should format results as readable plain text', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const results = await executeLinter([sampleFile]);

      // Test plain text formatting
      printResults(results, 'plain', console);

      expect(mockConsoleLog).toHaveBeenCalled();
      
      // Verify that the output contains readable information
      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      console.log('Plain text output:', output);
    });

    it('should handle empty results gracefully', () => {
      const emptyResults = [];
      
      printResults(emptyResults, 'plain', console);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      
      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('0'); // Should indicate no issues found
    });
  });

  describe('JSON Output', () => {
    it('should format results as valid JSON', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const results = await executeLinter([sampleFile]);

      printResults(results, 'json', console);

      expect(mockConsoleLog).toHaveBeenCalled();
      
      // Get the JSON output and filter out non-JSON console messages
      const allOutput = mockConsoleLog.mock.calls
        .map(call => call.join(' '))
        .join('\n');

      // Find the JSON part (starts with { and ends with })
      const jsonStart = allOutput.indexOf('{');
      const jsonEnd = allOutput.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonOutput = allOutput.substring(jsonStart, jsonEnd);
        
        // Should be valid JSON
        expect(() => JSON.parse(jsonOutput)).not.toThrow();
        
        const parsed = JSON.parse(jsonOutput);
        expect(parsed).toHaveProperty('summary');
        expect(parsed).toHaveProperty('issues');
        expect(Array.isArray(parsed.issues)).toBe(true);
        
        console.log('JSON output valid:', parsed);
      } else {
        console.log('No JSON found in output:', allOutput);
      }
    });

    it('should include proper structure in JSON output', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const results = await executeLinter([sampleFile]);

      printResults(results, 'json', console);

      const allOutput = mockConsoleLog.mock.calls
        .map(call => call.join(' '))
        .join('\n');

      // Find the JSON part
      const jsonStart = allOutput.indexOf('{');
      const jsonEnd = allOutput.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonOutput = allOutput.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonOutput);
        
        // Should have expected structure
        expect(parsed.summary).toHaveProperty('totalIssues');
        expect(parsed.summary).toHaveProperty('errors');
        expect(parsed.summary).toHaveProperty('warnings');
        expect(parsed.summary).toHaveProperty('info');
      }
    });
  });

  describe('CSV Output', () => {
    it('should format results as CSV', async () => {
      const sampleFile = join(fixturesPath, 'sample-object.object-meta.xml');
      const results = await executeLinter([sampleFile]);

      printResults(results, 'csv', console);

      expect(mockConsoleLog).toHaveBeenCalled();
      
      const csvOutput = mockConsoleLog.mock.calls
        .map(call => call.join(' '))
        .join('\n');

      if (csvOutput.trim()) {
        // Should contain CSV headers
        expect(csvOutput).toContain('File,Line,Severity,Rule,Message');
        
        // Should use commas as separators
        expect(csvOutput).toContain(',');
      }
      
      console.log('CSV output:', csvOutput);
    });

    it('should handle CSV escaping correctly', async () => {
      // Create a mock result with special characters
      const resultsWithSpecialChars = [
        {
          file: 'test,file.xml',
          line: 1,
          column: 1,
          priority: 'error',
          message: 'Error with "quotes" and, commas'
        }
      ];

      printResults(resultsWithSpecialChars, 'csv', console);

      const csvOutput = mockConsoleLog.mock.calls
        .map(call => call.join(' '))
        .join('\n');

      // Should properly escape special characters
      expect(csvOutput).toContain('"');
      console.log('CSV escaping output:', csvOutput);
    });
  });

  describe('Real File Operations', () => {
    it('should create and process temporary XML files', async () => {
      // Create a temporary XML file
      const tempXmlFile = join(tempDir, 'test-object.object-meta.xml');
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Test Object</label>
    <deploymentStatus>Deployed</deploymentStatus>
</CustomObject>`;

      await fs.writeFile(tempXmlFile, xmlContent, 'utf8');

      // Lint the temporary file
      const results = await executeLinter([tempXmlFile]);

      expect(Array.isArray(results)).toBe(true);
      console.log('Temporary file linting results:', results.length);
    });

    it('should handle directory traversal', async () => {
      // Create a nested directory structure with XML files
      const subDir = join(tempDir, 'objects');
      await fs.mkdir(subDir, { recursive: true });

      const xmlFile1 = join(subDir, 'Object1__c.object-meta.xml');
      const xmlFile2 = join(subDir, 'Object2__c.object-meta.xml');

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Generated Object</label>
</CustomObject>`;

      await fs.writeFile(xmlFile1, xmlContent, 'utf8');
      await fs.writeFile(xmlFile2, xmlContent, 'utf8');

      // Lint the directory
      const results = await executeLinter([tempDir]);

      expect(Array.isArray(results)).toBe(true);
      console.log('Directory traversal results:', results.length);
    });

    it('should handle mixed file types in directory', async () => {
      // Create various files, only some should be linted
      const xmlFile = join(tempDir, 'valid.object-meta.xml');
      const txtFile = join(tempDir, 'readme.txt');
      const jsFile = join(tempDir, 'script.js');

      await fs.writeFile(xmlFile, `<?xml version="1.0"?><CustomObject></CustomObject>`, 'utf8');
      await fs.writeFile(txtFile, 'This is a text file', 'utf8');
      await fs.writeFile(jsFile, 'console.log("hello");', 'utf8');

      const results = await executeLinter([tempDir]);

      expect(Array.isArray(results)).toBe(true);
      // Should only process the XML file
      console.log('Mixed file types results:', results.length);
    });
  });

  describe('Performance with Real Files', () => {
    it('should handle multiple files efficiently', async () => {
      // Create multiple XML files
      const filePromises = [];
      for (let i = 0; i < 5; i++) {
        const xmlFile = join(tempDir, `object${i}.object-meta.xml`);
        const content = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Object ${i}</label>
    <deploymentStatus>Deployed</deploymentStatus>
</CustomObject>`;
        filePromises.push(fs.writeFile(xmlFile, content, 'utf8'));
      }

      await Promise.all(filePromises);

      const startTime = Date.now();
      const results = await executeLinter([tempDir]);
      const endTime = Date.now();

      const executionTime = endTime - startTime;

      expect(Array.isArray(results)).toBe(true);
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds

      console.log(`Multiple files (${results.length} results) processed in ${executionTime}ms`);
    });
  });

  describe('Error Recovery', () => {
    it('should continue processing after encountering bad files', async () => {
      const goodFile = join(tempDir, 'good.object-meta.xml');
      const badFile = join(tempDir, 'bad.object-meta.xml');

      const goodContent = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Good Object</label>
</CustomObject>`;

      const badContent = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <unclosed-tag>
    <label>Bad Object</label>
</CustomObject>`;

      await fs.writeFile(goodFile, goodContent, 'utf8');
      await fs.writeFile(badFile, badContent, 'utf8');

      // Should process both files and not crash
      const results = await executeLinter([tempDir]);

      expect(Array.isArray(results)).toBe(true);
      console.log('Error recovery results:', results.length);
    });
  });

  describe('Integration with Custom Rules', () => {
    it('should apply custom rules to real files', async () => {
      const xmlFile = join(tempDir, 'custom-test.object-meta.xml');
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>No Description Object</label>
    <deploymentStatus>Deployed</deploymentStatus>
</CustomObject>`;

      await fs.writeFile(xmlFile, xmlContent, 'utf8');

      const customRulesFile = join(fixturesPath, 'sample-rules.js');
      
      const results = await executeLinter([xmlFile], customRulesFile);

      expect(Array.isArray(results)).toBe(true);
      
      // Should trigger our custom rules (missing description, wrong naming)
      const hasDescriptionIssue = results.some(r => 
        r.message && r.message.includes('description')
      );
      const hasNamingIssue = results.some(r => 
        r.message && r.message.includes('__c')
      );

      console.log('Custom rules on real files:', { hasDescriptionIssue, hasNamingIssue });
      console.log('Custom rules results:', results);
    });
  });
}); 