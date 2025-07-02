import Rule from '../objects/Rule.js';

function loadRules(rawRules) {
  const rules = [];

  for (const [name, def] of Object.entries(rawRules)) {
    rules.push(new Rule(name, def));
  }

  return rules;
}

export default loadRules;
