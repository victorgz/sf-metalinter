import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { executeLinter } from '../../index.js';
import * as printer from '../../utils/printer.js';

class MetalinterLint extends SfCommand {
	static summary = 'Lint Salesforce metadata files';
	static description = 'Analyze Salesforce metadata files for potential issues and best practices violations.';

	static examples = [
		'<%= config.bin %> <%= command.id %> --path ./force-app',
		'<%= config.bin %> <%= command.id %> --path ./force-app --rules ./custom-rules.js',
		'<%= config.bin %> <%= command.id %> --path ./force-app --format json',
		'<%= config.bin %> <%= command.id %> --path ./force-app --format csv',
	];

	static flags = {
		path: Flags.string( {
			char: 'p',
			summary: 'Comma-separated list of folders/files to lint',
			description: 'Specify the paths or glob patterns to Salesforce metadata files or directories to analyze.',
			default: 'force-app',
		} ),
		rules: Flags.file( {
			char: 'r',
			summary: 'Path to custom rules file',
			description: 'Optional path to a JavaScript file containing custom linting rules.',
			exists: true,
		} ),
		format: Flags.string( {
			char: 'f',
			summary: 'Output format for the results',
			description: 'Format the output as JSON or CSV.',
			options: [ 'json', 'csv' ],
		} ),
		severity: Flags.string( {
			char: 's',
			summary: 'Severity threshold for exit code',
			description: 'Exit with non-zero code when issues of this severity or higher are found.',
			options: [ 'error', 'warning', 'info', 'none' ],
			default: 'none',
			helpGroup: 'Behavior Options',
		} ),
	};

	async run() {
		const { flags } = await this.parse( MetalinterLint );
		// Parse and validate paths
		const paths = flags.path.split( ',' ).map( ( p ) => p.trim() );
		this.log( '✅ Paths to lint:', paths );

		try {
			// Execute the linter with the core logic from index.js
			const results = await executeLinter( paths, flags.rules );

			// Print results based on format
			printer.printResults( results, flags.format?.toLowerCase(), this );

			// Exit with error code if issues found based on severity threshold
			if ( results.length > 0 ) {
				const hasErrorsAtThreshold = this.shouldExitWithError( results, flags.severity );
				if ( hasErrorsAtThreshold ) {
					this.exit( 1 );
				}
			}
		} catch ( error ) {
			this.error( error.message );
		}
	}

	shouldExitWithError( results, severityThreshold ) {
		// Define severity levels in order of importance
		const severityLevels = {
			info: 3,
			warning: 2,
			error: 1,
			none: 0,
		};

		const thresholdPriority = severityLevels[ severityThreshold ];

		// Check if any results have priority <= threshold (lower number = higher severity)
		return results.some( ( r ) => r.priority <= thresholdPriority );
	}
}

export default MetalinterLint;
