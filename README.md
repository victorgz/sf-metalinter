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

## 📚 Documentation

For the detailed documentation, visit the [Wiki](https://github.com/victorgz/sf-metalinter/wiki):

- [🚀 Getting Started](https://github.com/victorgz/sf-metalinter/wiki/1---Getting-Started) - Installation and basic usage
- [📋 Built-in Rules](https://github.com/victorgz/sf-metalinter/wiki/2---Built-in-Rules) - Complete list of available rules
- [🛠️ Custom Rules](https://github.com/victorgz/sf-metalinter/wiki/3---Custom-Rules) - Create your own linting rules
- [🤝 Contributing](https://github.com/victorgz/sf-metalinter/blob/master/DEVELOPMENT.md) - How to contribute to the project
- [❓ FAQ](https://github.com/victorgz/sf-metalinter/discussions) - Frequently asked questions

## Dependencies

This plugin is built with:

- **[@oclif/core](https://github.com/oclif/core)** - CLI framework
- **[@salesforce/core](https://github.com/forcedotcom/sfdx-core)** - Salesforce core libraries
- **[@salesforce/sf-plugins-core](https://github.com/salesforcecli/sf-plugins-core)** - SF plugin utilities
- **[@xmldom/xmldom](https://github.com/xmldom/xmldom)** - XML DOM parser
- **[xpath](https://github.com/goto100/xpath)** - XPath query engine
- **[glob](https://github.com/isaacs/node-glob)** - File pattern matching
- **[minimatch](https://github.com/isaacs/minimatch)** - Pattern matching

## License

BSD-3-Clause © [Victor Garcia Zarco](https://github.com/victorgz)
