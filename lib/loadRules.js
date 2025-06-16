const path = require('path')
const Rule = require('./Rule')

function loadRules(filePath) {
  const absolutePath = path.resolve(filePath)
  const rawRules = require(absolutePath)
  const rules = []

  for (const [name, def] of Object.entries(rawRules)) {
    rules.push(new Rule(name, def))
  }

  return rules
}

module.exports = loadRules
