import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { executeLinter } from '../../index.js';

class MetalinterLint extends SfCommand {
  static summary = 'Lint Salesforce metadata files';
  static description = 'Analyze Salesforce metadata files for potential issues and best practices violations.';

  static examples = [
    '<%= config.bin %> <%= command.id %> --path ./force-app',
    '<%= config.bin %> <%= command.id %> --path ./force-app --rules ./custom-rules.js',
    '<%= config.bin %> <%= command.id %> --path ./force-app --format json',
    '<%= config.bin %> <%= command.id %> --path ./force-app --format table',
    '<%= config.bin %> <%= command.id %> --path ./force-app --format csv',
  ];

  static flags = {
    path: Flags.string({
      char: 'p',
      summary: 'Comma-separated list of folders/files to lint',
      description: 'Specify the paths to Salesforce metadata files or directories to analyze.',
      required: true,
    }),
    rules: Flags.string({
      char: 'r',
      summary: 'Path to custom rules file',
      description: 'Optional path to a JavaScript file containing custom linting rules.',
    }),
    format: Flags.string({
      char: 'f',
      summary: 'Output format for the results',
      description: 'Format the output as JSON, table, or CSV.',
      options: ['json', 'table', 'csv'],
      default: 'json',
    }),
  };

  async run() {
    const { flags } = await this.parse(MetalinterLint);

    // Parse and validate paths
    const paths = flags.path.split(',').map((p) => p.trim());
    this.log('✅ Paths to lint:', paths);

    try {
      // Execute the linter with the core logic from index.js
      const results = await executeLinter(paths, flags.rules);

      // Print results based on format
      this.printResults(results, flags.format.toLowerCase());

      // Exit with error code if issues found
      if (results.length > 0) {
        // this.exit(1) - commented out for now
      }
    } catch (error) {
      this.error(error.message);
    }
  }

  printResults(results, format) {
    switch (format) {
      case 'json':
        this.printJsonResults(results);
        break;
      case 'table':
        this.printTableResults(results);
        break;
      case 'csv':
        this.printCsvResults(results);
        break;
      default:
        this.printJsonResults(results);
        break;
    }
  }

  printJsonResults(results) {
    const output = {
      summary: {
        totalIssues: results.length,
        errors: results.filter((r) => r.priority === 1).length,
        warnings: results.filter((r) => r.priority === 2).length,
        info: results.filter((r) => r.priority === 3).length,
      },
      issues: results.map((r) => ({
        file: r.filePath,
        line: r.line,
        rule: r.rule,
        message: r.message,
        priority: r.priority,
        severity: r.priority === 1 ? 'error' : r.priority === 2 ? 'warning' : 'info',
      })),
    };
    this.log(JSON.stringify(output, null, 2));
  }

  printTableResults(results) {
    if (results.length === 0) {
      this.log('✅ No issues found!');
      return;
    }

    // Calculate column widths
    const maxFileWidth = Math.max(...results.map((r) => r.filePath.length), 'File'.length);
    const maxRuleWidth = Math.max(...results.map((r) => r.rule.length), 'Rule'.length);
    const maxMessageWidth = Math.max(...results.map((r) => r.message.length), 'Message'.length, 50);

    // Print header
    this.log(
      '┌─' +
        '─'.repeat(maxFileWidth) +
        '─┬─' +
        '─'.repeat(4) +
        '─┬─' +
        '─'.repeat(8) +
        '─┬─' +
        '─'.repeat(maxRuleWidth) +
        '─┬─' +
        '─'.repeat(Math.min(maxMessageWidth, 50)) +
        '─┐'
    );
    this.log(
      '│ ' +
        'File'.padEnd(maxFileWidth) +
        ' │ Line │ Severity │ ' +
        'Rule'.padEnd(maxRuleWidth) +
        ' │ ' +
        'Message'.padEnd(Math.min(maxMessageWidth, 50)) +
        ' │'
    );
    this.log(
      '├─' +
        '─'.repeat(maxFileWidth) +
        '─┼─' +
        '─'.repeat(4) +
        '─┼─' +
        '─'.repeat(8) +
        '─┼─' +
        '─'.repeat(maxRuleWidth) +
        '─┼─' +
        '─'.repeat(Math.min(maxMessageWidth, 50)) +
        '─┤'
    );

    // Print rows
    for (const r of results) {
      const severity = r.priority === 1 ? 'ERROR' : r.priority === 2 ? 'WARNING' : 'INFO';
      const truncatedMessage = r.message.length > 50 ? r.message.substring(0, 47) + '...' : r.message;
      this.log(
        '│ ' +
          r.filePath.padEnd(maxFileWidth) +
          ' │ ' +
          String(r.line).padStart(4) +
          ' │ ' +
          severity.padEnd(8) +
          ' │ ' +
          r.rule.padEnd(maxRuleWidth) +
          ' │ ' +
          truncatedMessage.padEnd(Math.min(maxMessageWidth, 50)) +
          ' │'
      );
    }

    this.log(
      '└─' +
        '─'.repeat(maxFileWidth) +
        '─┴─' +
        '─'.repeat(4) +
        '─┴─' +
        '─'.repeat(8) +
        '─┴─' +
        '─'.repeat(maxRuleWidth) +
        '─┴─' +
        '─'.repeat(Math.min(maxMessageWidth, 50)) +
        '─┘'
    );
    this.log(`\n📊 Summary: ${results.length} issues found`);
  }

  printCsvResults(results) {
    // Print CSV header
    this.log('File,Line,Severity,Rule,Message');

    // Escape quotes and commas in CSV fields
    const escapeCsvField = (field) => {
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Print CSV rows
    for (const r of results) {
      const severity = r.priority === 1 ? 'ERROR' : r.priority === 2 ? 'WARNING' : 'INFO';

      this.log(
        [escapeCsvField(r.filePath), r.line, severity, escapeCsvField(r.rule), escapeCsvField(r.message)].join(',')
      );
    }
  }
}

export default MetalinterLint;
