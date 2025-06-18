"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Linter {
    constructor(rules) {
        this.rules = rules;
    }
    async runOnFile(file) {
        const messages = [];
        const report = (structuredMessage) => {
            messages.push(structuredMessage);
        };
        for (const rule of this.rules) {
            await rule.run(file, report);
        }
        return messages;
    }
}
module.exports = Linter;
//# sourceMappingURL=Linter.js.map