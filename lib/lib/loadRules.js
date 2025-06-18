"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const Rule = require('./Rule');
function loadRules(rawRules) {
    const rules = [];
    for (const [name, def] of Object.entries(rawRules)) {
        rules.push(new Rule(name, def));
    }
    return rules;
}
module.exports = loadRules;
//# sourceMappingURL=loadRules.js.map