import path from 'path';
import runLinterOnRepo from './lib/utils/runLinterOnRepo.js';
import baseRules from './rules.js';
import mergeRules from './lib/utils/mergeRules.js';
import loadRules from './lib/utils/loadRules.js';

// Main plugin entry point
export { default as MetalinterLint } from './commands/metalinter/lint.js';

/**
 * Main linting function that handles the complete linting process
 * @param {string[]} paths - Array of paths to lint
 * @param {string} [customRulesPath] - Optional path to custom rules file
 * @returns {Promise<Array>} - Array of linting results
 */
async function executeLinter(paths, customRulesPath = null) {
  // Resolve paths
  const resolvedPaths = paths.map((p) => path.resolve(process.cwd(), p.trim()));

  // Load custom rules if provided
  let customRules;
  if (customRulesPath) {
    try {
      // Resolve the path relative to the current working directory
      const rulesPath = path.resolve(process.cwd(), customRulesPath);

      // Note: ES modules are cached by default, but don't need manual cache clearing
      customRules = (await import(rulesPath)).default;
    } catch (err) {
      throw new Error(`Failed to load custom rules from ${customRulesPath}: ${err.message}`);
    }
  }

  // Merge base rules with custom rules and load them
  const rules = customRules ? loadRules(mergeRules(baseRules, customRules)) : loadRules(baseRules);

  console.log('✅ Number of rules to evaluate: ', rules.length);
  // Execute linter on the resolved paths
  const results = await runLinterOnRepo(resolvedPaths, rules);

  return results;
}

export { executeLinter };
