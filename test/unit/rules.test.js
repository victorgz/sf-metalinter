import { jest, describe, it, beforeEach, expect } from '@jest/globals';
import baseRules from '../../src/rules.js';

// Mock XMLElement for testing
class MockXMLElement {
  constructor(textContent, lineNumber = 1) {
    this._text = textContent;
    this._line = lineNumber;
  }
  
  text() {
    return this._text;
  }
  
  line() {
    return this._line;
  }
}

// Mock ParsedXMLDocument
class MockParsedXMLDocument {
  constructor(elements = {}) {
    this.elements = elements;
  }
  
  get(xpath) {
    return this.elements[xpath] || null;
  }
}

describe('Base Rules', () => {
  let mockReport;
  
  beforeEach(() => {
    mockReport = jest.fn();
  });

  describe('missing-description rule', () => {
    it('should report when description is missing', () => {
      const rule = baseRules['missing-description'];
      const file = {
        parsedXml: new MockParsedXMLDocument({})
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('XML metadata is missing description');
    });

    it('should not report when description is present', () => {
      const rule = baseRules['missing-description'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//description': new MockXMLElement('This is a description', 5)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle null parsedXml', () => {
      const rule = baseRules['missing-description'];
      const file = {
        parsedXml: null
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('XML metadata is missing description');
    });
  });

  describe('deprecated-api-version rule', () => {
    it('should report when API version is below 30.0', () => {
      const rule = baseRules['deprecated-api-version'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//apiVersion': new MockXMLElement('29.0', 8)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('API Version is deprecated: 29', 8);
    });

    it('should report when API version is exactly 29.0', () => {
      const rule = baseRules['deprecated-api-version'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//apiVersion': new MockXMLElement('29.0', 3)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('API Version is deprecated: 29', 3);
    });

    it('should not report when API version is 30.0 or higher', () => {
      const rule = baseRules['deprecated-api-version'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//apiVersion': new MockXMLElement('30.0', 5)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should not report when API version is much higher', () => {
      const rule = baseRules['deprecated-api-version'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//apiVersion': new MockXMLElement('58.0', 2)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle missing API version', () => {
      const rule = baseRules['deprecated-api-version'];
      const file = {
        parsedXml: new MockParsedXMLDocument({})
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle null parsedXml', () => {
      const rule = baseRules['deprecated-api-version'];
      const file = {
        parsedXml: null
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });
  });

  describe('flow-inactive rule', () => {
    it('should report when flow status is not Active', () => {
      const rule = baseRules['flow-inactive'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//status': new MockXMLElement('Draft', 12)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('Flow is not active', 12);
    });

    it('should report when flow status is Obsolete', () => {
      const rule = baseRules['flow-inactive'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//status': new MockXMLElement('Obsolete', 7)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('Flow is not active', 7);
    });

    it('should not report when flow status is Active', () => {
      const rule = baseRules['flow-inactive'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//status': new MockXMLElement('Active', 5)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle missing status', () => {
      const rule = baseRules['flow-inactive'];
      const file = {
        parsedXml: new MockParsedXMLDocument({})
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should have correct include pattern', () => {
      const rule = baseRules['flow-inactive'];
      expect(rule.include).toEqual(['**/*.flow-meta.xml']);
    });
  });

  describe('object-internal-sharing-no-readwrite rule', () => {
    it('should report when internal sharing model is ReadWrite', () => {
      const rule = baseRules['object-internal-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//sharingModel': new MockXMLElement('ReadWrite', 25)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('Object internal sharing is Public ReadWrite', 25);
    });

    it('should not report when internal sharing model is Private', () => {
      const rule = baseRules['object-internal-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//sharingModel': new MockXMLElement('Private', 20)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should not report when internal sharing model is Read', () => {
      const rule = baseRules['object-internal-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//sharingModel': new MockXMLElement('Read', 18)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle missing sharing model', () => {
      const rule = baseRules['object-internal-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({})
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should have correct include pattern', () => {
      const rule = baseRules['object-internal-sharing-no-readwrite'];
      expect(rule.include).toEqual(['**/*.object-meta.xml']);
    });
  });

  describe('object-external-sharing-no-readwrite rule', () => {
    it('should report when external sharing model is ReadWrite', () => {
      const rule = baseRules['object-external-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//externalSharingModel': new MockXMLElement('ReadWrite', 30)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('Object external sharing is Public Read/Write', 30);
    });

    it('should not report when external sharing model is Private', () => {
      const rule = baseRules['object-external-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//externalSharingModel': new MockXMLElement('Private', 28)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle missing external sharing model', () => {
      const rule = baseRules['object-external-sharing-no-readwrite'];
      const file = {
        parsedXml: new MockParsedXMLDocument({})
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should have correct include pattern', () => {
      const rule = baseRules['object-external-sharing-no-readwrite'];
      expect(rule.include).toEqual(['**/*.object-meta.xml']);
    });

    it('should have correct priority', () => {
      const rule = baseRules['object-external-sharing-no-readwrite'];
      expect(rule.priority).toBe(1);
    });
  });

  describe('named-credential-no-hardcoded-password rule', () => {
    it('should report when protocol is Password and password is set', () => {
      const rule = baseRules['named-credential-no-hardcoded-password'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//protocol': new MockXMLElement('Password', 10),
          '//password': new MockXMLElement('mypassword123', 15)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).toHaveBeenCalledWith('Named Credential has a password explicitly set', 15);
    });

    it('should not report when protocol is not Password', () => {
      const rule = baseRules['named-credential-no-hardcoded-password'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//protocol': new MockXMLElement('OAuth', 10),
          '//password': new MockXMLElement('somevalue', 15)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should not report when protocol is Password but no password element', () => {
      const rule = baseRules['named-credential-no-hardcoded-password'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//protocol': new MockXMLElement('Password', 10)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should handle missing protocol', () => {
      const rule = baseRules['named-credential-no-hardcoded-password'];
      const file = {
        parsedXml: new MockParsedXMLDocument({
          '//password': new MockXMLElement('somepassword', 12)
        })
      };
      
      rule.linter({ file, report: mockReport });
      
      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should have correct include pattern', () => {
      const rule = baseRules['named-credential-no-hardcoded-password'];
      expect(rule.include).toEqual(['**/*.namedCredential-meta.xml']);
    });

    it('should have correct priority', () => {
      const rule = baseRules['named-credential-no-hardcoded-password'];
      expect(rule.priority).toBe(1);
    });
  });

  describe('rules configuration', () => {
    it('should have all expected rules', () => {
      const expectedRules = [
        'missing-description',
        'deprecated-api-version', 
        'flow-inactive',
        'object-internal-sharing-no-readwrite',
        'object-external-sharing-no-readwrite',
        'named-credential-no-hardcoded-password'
      ];
      
      expectedRules.forEach(ruleName => {
        expect(baseRules).toHaveProperty(ruleName);
        expect(baseRules[ruleName]).toHaveProperty('linter');
        expect(typeof baseRules[ruleName].linter).toBe('function');
      });
    });

    it('should have proper rule structure', () => {
      Object.keys(baseRules).forEach(ruleName => {
        const rule = baseRules[ruleName];
        expect(rule).toHaveProperty('linter');
        expect(typeof rule.linter).toBe('function');
        
        if (rule.priority !== undefined) {
          expect(typeof rule.priority).toBe('number');
          expect(rule.priority).toBeGreaterThan(0);
        }
        
        if (rule.include !== undefined) {
          expect(Array.isArray(rule.include)).toBe(true);
        }
        
        if (rule.description !== undefined) {
          expect(typeof rule.description).toBe('string');
          expect(rule.description.length).toBeGreaterThan(0);
        }
      });
    });
  });
}); 