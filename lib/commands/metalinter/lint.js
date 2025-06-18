"use strict";
const { Command, Flags } = require('@oclif/core');
const { executeLinter } = require('../../index.js');
class MetalinterLint extends Command {
    async run() {
        const { flags } = await this.parse(MetalinterLint);
        // Parse and validate paths
        const paths = flags.path.split(',').map((p) => p.trim());
        console.log('✅ Paths to lint:', paths);
        try {
            // Execute the linter with the core logic from index.js
            const results = await executeLinter(paths, flags.rules);
            // Print results
            this.printResults(results);
            // Exit with error code if issues found
            if (results.length > 0) {
                // this.exit(1) - commented out for now
            }
        }
        catch (error) {
            this.error(error.message);
        }
    }
    printResults(results) {
        for (const r of results) {
            const icon = r.priority === 1 ? '🔴' : r.priority === 2 ? '🟡' : 'ℹ️';
            console.log(`${icon} ${r.filePath}:${r.line} ▶️ [${r.rule}] ${r.message}`);
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