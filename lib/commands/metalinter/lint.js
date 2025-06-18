"use strict";
const { Command, Flags } = require('@oclif/core');
const path = require('path');
const runLinterOnRepo = require('../../lib/runLinterOnRepo');
const baseRules = require('../../rules.js');
const mergeRules = require('../../lib/mergeRules');
const loadRules = require('../../lib/loadRules');
class MetalinterLint extends Command {
    async run() {
        const { flags } = await this.parse(MetalinterLint);
        const paths = flags.path.split(',').map(p => path.resolve(process.cwd(), p.trim()));
        console.log('Resolved paths to lint:', paths);
        let customRules = {};
        if (flags.rules) {
            try {
                console.log('1 going to load custom rules from:', flags.rules);
                // Resolve the path relative to the current working directory
                const rulesPath = path.resolve(process.cwd(), flags.rules);
                console.log('2 resolved path:', rulesPath);
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
                this.error(`Failed to load custom rules from ${flags.rules}: ${err.message}`);
            }
        }
        const rules = loadRules(mergeRules(baseRules, customRules));
        const results = await runLinterOnRepo(paths, rules);
        for (const r of results) {
            //this.log( `[${msg.rule}] ${msg.message} (${msg.filePath}:${msg.line || '0'})` )
            const icon = r.priority === 1 ? '🔴' : r.priority === 2 ? '🟡' : 'ℹ️';
            console.log(`${icon} ${r.filePath}:${r.line} ▶️ [${r.rule}] ${r.message}`);
        }
        if (results.length > 0) {
            //this.exit( 1 )
        }
    }
}
MetalinterLint.description = 'Lint Salesforce metadata files';
MetalinterLint.flags = {
    path: Flags.string({
        char: 'p',
        description: 'Comma-separated list of folders/files to lint',
        required: true,
    }),
    rules: Flags.string({
        char: 'r',
        description: 'Path to custom rules file (optional)',
    }),
};
module.exports = MetalinterLint;
//# sourceMappingURL=lint.js.map