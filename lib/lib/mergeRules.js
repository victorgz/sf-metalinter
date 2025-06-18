"use strict";
function mergeRules(baseRules, userRules) {
    const merged = {};
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
        }
        else {
            // New custom rule
            merged[ruleName] = userRule;
        }
    }
    return merged;
}
module.exports = mergeRules;
//# sourceMappingURL=mergeRules.js.map