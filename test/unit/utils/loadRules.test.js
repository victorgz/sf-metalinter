import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

// Mock the Rule class using the proper ES module mocking approach
const mockRule = jest.fn().mockImplementation((name, def) => ({ name, definition: def }));

jest.unstable_mockModule('../../../src/objects/Rule.js', () => ({
  default: mockRule
}));

// Import after mocking
const { default: loadRules } = await import('../../../src/utils/loadRules.js');

describe('loadRules', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should create Rule instances from raw rules object', () => {
    const rawRules = {
      'rule-1': { priority: 'error', linter: jest.fn() },
      'rule-2': { priority: 'warning', linter: jest.fn() }
    };

    const result = loadRules(rawRules);

    // Test that Rule constructor was called correctly
    expect(mockRule).toHaveBeenCalledTimes(2);
    expect(mockRule).toHaveBeenCalledWith('rule-1', rawRules['rule-1']);
    expect(mockRule).toHaveBeenCalledWith('rule-2', rawRules['rule-2']);
    
    // Test the functionality: should return array of Rule instances
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'rule-1', definition: rawRules['rule-1'] });
    expect(result[1]).toEqual({ name: 'rule-2', definition: rawRules['rule-2'] });
  });

  it('should handle empty rules object', () => {
    const rawRules = {};

    const result = loadRules(rawRules);

    expect(mockRule).not.toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should preserve rule definitions when creating Rule instances', () => {
    const mockLinter = jest.fn();
    const rawRules = {
      'complex-rule': {
        priority: 'error',
        linter: mockLinter,
        include: ['**/*.cls'],
        exclude: ['**/test/**'],
        description: 'A complex rule'
      }
    };

    const result = loadRules(rawRules);

    expect(mockRule).toHaveBeenCalledWith('complex-rule', {
      priority: 'error',
      linter: mockLinter,
      include: ['**/*.cls'],
      exclude: ['**/test/**'],
      description: 'A complex rule'
    });
    expect(result).toHaveLength(1);
  });

  it('should handle rules with minimal configuration', () => {
    const rawRules = {
      'minimal-rule': { linter: jest.fn() }
    };

    const result = loadRules(rawRules);

    expect(mockRule).toHaveBeenCalledWith('minimal-rule', { linter: expect.any(Function) });
    expect(result).toHaveLength(1);
  });

  it('should return an array of the correct length for multiple rules', () => {
    const rawRules = {
      'rule-1': { linter: jest.fn() },
      'rule-2': { linter: jest.fn() },
      'rule-3': { linter: jest.fn() },
      'rule-4': { linter: jest.fn() }
    };

    const result = loadRules(rawRules);

    expect(result).toHaveLength(4);
    expect(mockRule).toHaveBeenCalledTimes(4);
  });

  it('should maintain the order of rules', () => {
    const rawRules = {
      'first-rule': { linter: jest.fn() },
      'second-rule': { linter: jest.fn() },
      'third-rule': { linter: jest.fn() }
    };

    const result = loadRules(rawRules);

    // Object.entries maintains insertion order in modern JavaScript
    expect(result[0].name).toBe('first-rule');
    expect(result[1].name).toBe('second-rule');
    expect(result[2].name).toBe('third-rule');
  });

  it('should handle rules with different property combinations', () => {
    const rawRules = {
      'rule-with-priority': { linter: jest.fn(), priority: 'warning' },
      'rule-with-include': { linter: jest.fn(), include: ['**/*.cls'] },
      'rule-with-exclude': { linter: jest.fn(), exclude: ['**/test/**'] }
    };

    const result = loadRules(rawRules);

    expect(mockRule).toHaveBeenCalledTimes(3);
    expect(result).toHaveLength(3);
  });
}); 