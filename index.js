const path = require( 'path' )
const loadRules = require( path.join( __dirname, './lib/loadRules' ) )
const runLinterOnRepo = require( path.join( __dirname, './lib/runLinterOnRepo' ) )
const mergeRules = require( path.join( __dirname, './lib/mergeRules' ) )

async function main() {
	const args = process.argv.slice( 2 )
	const baseRules = require( path.join( __dirname, './rules.js' ) )
	let userRules = {}
	try {
		//userRules = require(path.join(__dirname,'./user-rules.js'))
		userRules = require( path.resolve(args[0]) );
	} catch ( err ) {
		console.error( '❌ Error loading user rules:', err.message )
		process.exit( 1 )
	}
	const rules = loadRules( mergeRules( baseRules, userRules ) );
	const results = await runLinterOnRepo( [ 'force-app' ], rules )


	//Print results
	results.forEach( r => {
		const icon = r.priority === 1 ? '🔴' : r.priority === 2 ? '🟡' : 'ℹ️'
		console.log( `${icon} ${r.filePath}:${r.line} ▶️ [${r.rule}] ${r.message}` )
		//console.log(`${r.filePath};${r.line};${r.rule};${r.message}`)
	} )
}

main().catch( err => {
	console.error( 'Linter failed:', err )
} )
