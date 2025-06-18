"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Command, Flags } = require('@oclif/core');
const runLinterOnRepo = require('../../lib/runLinterOnRepo');
const baseRules = require('../../rules.js');
const mergeRules = require('../../lib/mergeRules');
class MetalinterLint extends Command {
    async run() {
        const { flags } = await this.parse(MetalinterLint);
        const paths = flags.path.split(',').map(p => p.trim());
        let customRules = {};
        if (flags.rules) {
            try {
                customRules = require(flags.rules);
            }
            catch (err) {
                this.error(`Failed to load custom rules: ${err.message}`);
            }
        }
        const rules = mergeRules(baseRules, customRules);
        const results = await runLinterOnRepo(paths, rules);
        for (const msg of results) {
            this.log(`[${msg.rule}] ${msg.message} (${msg.filePath}:${msg.line || '-'})`);
        }
        if (results.length > 0) {
            this.exit(1);
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
        description: 'Path to custom rules file (optional)',
    }),
};
module.exports = MetalinterLint;
//# sourceMappingURL=lint.js.map