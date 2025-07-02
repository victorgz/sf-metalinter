function mergeRules(baseRules, userRules) {
  const merged = {};

  // eslint-disable-next-line guard-for-in
  for (const ruleName in userRules) {
    const userRule = userRules[ruleName];
    const baseRule = baseRules[ruleName];

    if (baseRule) {
      // Merge override into base rule (preserving base linter if not overridden)
      merged[ruleName] = {
        ...baseRule,
        ...userRule,
        linter: baseRule.linter,
        description: baseRule.description, // Preserve base description
      };
    } else {
      // New custom rule
      merged[ruleName] = userRule;
    }
  }

  return merged;
}

export default mergeRules;
