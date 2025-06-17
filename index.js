const path = require('path')
const loadRules = require(path.join(__dirname, './lib/loadRules'))
const runLinterOnRepo = require(path.join(__dirname, './lib/runLinterOnRepo'))

async function main() {
  const rules = loadRules(path.join(__dirname,'./rules.js'))
  const results = await runLinterOnRepo(['force-app'], rules)


  //Print results
  results.forEach(r => {
	const icon = r.priority === 1 ? '🔴' : r.priority === 2 ? '🟡' : 'ℹ️'
    //console.log(`${icon} ${r.filePath}:${r.line} ▶️ [${r.rule}] ${r.message}`)
    console.log(`${r.filePath};${r.line};${r.rule};${r.message}`)
  })
}

main().catch(err => {
  console.error('Linter failed:', err)
})
