const { minimatch } = require('minimatch');

class Rule {
  constructor(name, definition) {
    this.name = name;
    this.priority = definition.priority;
    this.linter = definition.linter;
    this.include = definition.include || ['**/*.*-meta.xml'];
    this.exclude = definition.exclude || [];
  }

  async run(file, parentReport) {
    // Provide a report function that builds the structured object

    const isIncluded = this.include.some((includeGlob) => minimatch(file.path, includeGlob));
    const isExcluded = this.exclude.some((excludeGlob) => minimatch(file.path, excludeGlob));

    if (!isIncluded || isExcluded) {
      return;
    }
    const report = (message, line) => {
      parentReport({
        rule: this.name,
        priority: this.priority,
        message,
        filePath: file.path,
        line: line ?? 0,
      });
    };

    await this.linter({ file, report });
  }
}

module.exports = Rule;
