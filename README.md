# sf-metalinter

A Salesforce CLI plugin for linting Salesforce metadata files to ensure code quality and consistency across your Salesforce projects.

## Features

- ✅ Lint Salesforce metadata files with customizable rules
- 🎯 Support for multiple file paths and directories
- 📋 Custom rule configuration support
- 🚀 Easy integration with Salesforce CLI workflows

## Installation

Install as a Salesforce CLI plugin:

```bash
sf plugins install sf-metalinter
```

## Usage

### Basic Linting
Lint a specific directory or file:

```bash
sf metalinter lint --path force-app/main/default
```

### Multiple Paths
Lint multiple directories or files:

```bash
sf metalinter lint --path "force-app/main/default,force-app/lwc"
```

### Custom Rules
Use custom rules file:

```bash
sf metalinter lint --path force-app/main/default --rules ./my-custom-rules.js
```

### Command Options

| Flag | Short | Description | Required |
|------|-------|-------------|----------|
| `--path` | `-p` | Comma-separated list of folders/files to lint | Yes |
| `--rules` | `-r` | Path to custom rules file | No |

## Dependencies

This plugin is built with:

- **[@oclif/core](https://github.com/oclif/core)** - CLI framework
- **[@salesforce/core](https://github.com/forcedotcom/sfdx-core)** - Salesforce core libraries  
- **[@salesforce/sf-plugins-core](https://github.com/salesforcecli/sf-plugins-core)** - SF plugin utilities
- **[libxmljs](https://github.com/libxmljs/libxmljs)** - XML parsing
- **[glob](https://github.com/isaacs/node-glob)** - File pattern matching
- **[minimatch](https://github.com/isaacs/minimatch)** - Pattern matching

## Custom Rules

You can create your own custom rules file to extend or override the default linting behavior.

### Creating a Custom Rules File

Create a JavaScript file (e.g., `my-custom-rules.js`) with the following structure:

```javascript
module.exports = {
	// Override existing rule priority/scope
  "missing-description": {
    priority: 1,
    include: ['**/*.field-meta.xml'], // Only check fields for descriptions
    exclude: ['**/*.object-meta.xml']
  },

	// Create your custom rule
  "field-missing-help-text": {
    priority: 2, 
    description: "Custom fields should have help text",
    linter: function({ file, report }) {
      const helpText = file.parsedXml?.get('//inlineHelpText');
      const fieldType = file.parsedXml?.get('//type');
      if (!helpText && fieldType) {
        report("Custom field is missing help text");
      }
    },
    include: ['**/*.field-meta.xml']
  }
  
  
}
```





### Using Your Custom Rules

```bash
sf metalinter lint --path force-app/main/default --rules ./my-custom-rules.js
```

## License

BSD-3-Clause © [Victor Garcia Zarco](https://github.com/victorgz)

---


