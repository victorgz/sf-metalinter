import mergeRules from '../../../src/utils/mergeRules.js';
import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';

describe('mergeRules', () => {
  let baseRules;
  let userRules;

  beforeEach(() => {
    baseRules = {
      'base-rule-1': {
        priority: 'error',
        linter: jest.fn(),
        description: 'Base rule 1 description',
        include: ['**/*.xml'],
      },
      'base-rule-2': {
        priority: 'warning',
        linter: jest.fn(),
        description: 'Base rule 2 description',
        exclude: ['**/temp/**'],
      },
    };

    userRules = {
      'base-rule-1': {
        priority: 'warning', // Override priority only
      },
      'user-rule-1': {
        priority: 'error',
        linter: jest.fn(),
        include: ['**/*.cls'],
      },
    };
  });

  it('should merge user rules with base rules', () => {
    const result = mergeRules(baseRules, userRules);

    expect(result).toHaveProperty('base-rule-1');
    expect(result).toHaveProperty('user-rule-1');
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('should preserve base linter when overriding existing rule', () => {
    const result = mergeRules(baseRules, userRules);

    expect(result['base-rule-1'].linter).toBe(baseRules['base-rule-1'].linter);
    expect(result['base-rule-1'].priority).toBe('warning'); // Overridden
    expect(result['base-rule-1'].include).toEqual(['**/*.xml']); // From base
  });

  it('should preserve base description when overriding existing rule', () => {
    const result = mergeRules(baseRules, userRules);

    expect(result['base-rule-1'].description).toBe('Base rule 1 description');
  });

  it('should allow user to override other properties except linter and description', () => {
    const userRulesWithOverrides = {
      'base-rule-1': {
        priority: 'info',
        include: ['**/*.trigger'],
        exclude: ['**/custom/**'],
        customProperty: 'custom value',
      },
    };

    const result = mergeRules(baseRules, userRulesWithOverrides);

    expect(result['base-rule-1']).toEqual({
      priority: 'info', // Overridden
      linter: baseRules['base-rule-1'].linter, // Preserved
      description: 'Base rule 1 description', // Preserved
      include: ['**/*.trigger'], // Overridden
      exclude: ['**/custom/**'], // Added
      customProperty: 'custom value', // Added
    });
  });

  it('should add new custom rules without modification', () => {
    const result = mergeRules(baseRules, userRules);

    expect(result['user-rule-1']).toEqual({
      priority: 'error',
      linter: userRules['user-rule-1'].linter,
      include: ['**/*.cls'],
    });
  });

  it('should handle empty user rules', () => {
    const result = mergeRules(baseRules, {});

    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should handle empty base rules', () => {
    const result = mergeRules({}, userRules);

    expect(result).toEqual(userRules);
    expect(result['user-rule-1']).toBe(userRules['user-rule-1']);
  });

  it('should handle both empty rule sets', () => {
    const result = mergeRules({}, {});

    expect(result).toEqual({});
  });

  it('should only process user rules and not include base rules not overridden', () => {
    const result = mergeRules(baseRules, userRules);

    // Only rules mentioned in userRules should be in the result
    expect(Object.keys(result)).toEqual(['base-rule-1', 'user-rule-1']);
    expect(result).not.toHaveProperty('base-rule-2');
  });

  it('should handle complex merge scenarios', () => {
    const complexBaseRules = {
      'rule-a': {
        priority: 'error',
        linter: jest.fn(),
        description: 'Rule A description',
        include: ['**/*.xml'],
        exclude: ['**/temp/**'],
        metadata: { version: '1.0' },
      },
      'rule-b': {
        priority: 'warning',
        linter: jest.fn(),
        description: 'Rule B description',
      },
    };

    const complexUserRules = {
      'rule-a': {
        priority: 'warning',
        exclude: ['**/custom/**'],
        metadata: { version: '2.0', author: 'user' },
        newProperty: 'new value',
      },
      'rule-c': {
        priority: 'info',
        linter: jest.fn(),
        include: ['**/*.cls'],
      },
    };

    const result = mergeRules(complexBaseRules, complexUserRules);

    expect(result['rule-a']).toEqual({
      priority: 'warning', // Overridden
      linter: complexBaseRules['rule-a'].linter, // Preserved
      description: 'Rule A description', // Preserved
      include: ['**/*.xml'], // From base
      exclude: ['**/custom/**'], // Overridden
      metadata: { version: '2.0', author: 'user' }, // Overridden
      newProperty: 'new value', // Added
    });

    expect(result['rule-c']).toEqual(complexUserRules['rule-c']);
    expect(result).not.toHaveProperty('rule-b');
  });

  it('should handle null and undefined values in user rules', () => {
    const userRulesWithNulls = {
      'base-rule-1': {
        priority: null,
        include: undefined,
        exclude: null,
      },
    };

    const result = mergeRules(baseRules, userRulesWithNulls);

    expect(result['base-rule-1']).toEqual({
      priority: null, // Overridden with null
      linter: baseRules['base-rule-1'].linter, // Preserved
      description: 'Base rule 1 description', // Preserved
      include: undefined, // Overridden with undefined
      exclude: null, // Added as null
    });
  });
});
