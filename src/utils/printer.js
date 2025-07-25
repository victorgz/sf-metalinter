/**
 * Printer utility for formatting and displaying linting results
 */

export function printResults(results, format, logger) {
  switch (format) {
    case 'json':
      printJsonResults(results, logger);
      break;
    case 'csv':
      printCsvResults(results, logger);
      break;
    default:
      printPlainResults(results, logger);
      break;
  }
}

export function printPlainResults(results, logger) {
  for (const r of results) {
    const severity = r.priority === 1 ? 'ERROR' : r.priority === 2 ? 'WARNING' : 'INFO';
    logger.log(`[${severity}][${r.rule}] ${r.filePath}:${r.line}: ${r.message}`);
  }
  logger.log(`\n📊 Summary: ${results.length} issues found`);
}
export function printJsonResults(results, logger) {
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
  logger.log(JSON.stringify(output, null, 2));
}

export function printCsvResults(results, logger) {
  // Print CSV header
  logger.log('File,Line,Severity,Rule,Message');

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

    const csvRow = [
      escapeCsvField(r.filePath),
      r.line,
      severity,
      escapeCsvField(r.rule),
      escapeCsvField(r.message),
    ].join(',');
    logger.log(csvRow);
  }
}
