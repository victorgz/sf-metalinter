module.exports = {
	extends: [ 'eslint-config-salesforce' ],
	root: true,
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	rules: {
		header: 'off',
		'no-console': 'off',
		'class-methods-use-this': 'off',
		'object-shorthand': 'off',
		'unicorn/prefer-node-protocol': 'off',
		'jsdoc/tag-lines': 'off',
	},
};
