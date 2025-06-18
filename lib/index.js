"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalinterLint = void 0;
const path = require('path');
const runLinterOnRepo = require('./lib/utils/runLinterOnRepo.js');
const baseRules = require('./rules.js');
const mergeRules = require('./lib/utils/mergeRules.js');
const loadRules = require('./lib/utils/loadRules.js');
// Main plugin entry point
var lint_js_1 = require("./commands/metalinter/lint.js");
Object.defineProperty(exports, "MetalinterLint", { enumerable: true, get: function () { return __importDefault(lint_js_1).default; } });
/**
 * Main linting function that handles the complete linting process
 * @param {string[]} paths - Array of paths to lint
 * @param {string} [customRulesPath] - Optional path to custom rules file
 * @returns {Promise<Array>} - Array of linting results
 */
async function executeLinter(paths, customRulesPath = null) {
    // Resolve paths
    const resolvedPaths = paths.map(p => path.resolve(process.cwd(), p.trim()));
    // Load custom rules if provided
    let customRules;
    if (customRulesPath) {
        try {
            // Resolve the path relative to the current working directory
            const rulesPath = path.resolve(process.cwd(), customRulesPath);
            // Clear require cache to allow reloading (if already cached)
            try {
                delete require.cache[require.resolve(rulesPath)];
            }
            catch (cacheErr) {
                // Ignore cache errors - file might not be cached yet
            }
            customRules = require(rulesPath);
        }
        catch (err) {
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
module.exports = {
    executeLinter
};
//# sourceMappingURL=index.js.map