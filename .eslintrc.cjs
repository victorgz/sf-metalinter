module.exports = {
	extends: [ 'eslint-config-salesforce-typescript', 'plugin:sf-plugin/recommended' ],
	root: true,
	rules: {
		header: 'off',
	},
	overrides: [
		{
			files: [ 'src/**/*.js' ],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/explicit-member-accessibility': 'off',
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
				'@typescript-eslint/quotes': 'off',
				'no-console': 'off',
				'class-methods-use-this': 'off',
				'object-shorthand': 'off',
				'unicorn/prefer-node-protocol': 'off',
				'jsdoc/tag-lines': 'off',
				'sf-plugin/only-extend-SfCommand': 'off',
			},
		},
	],
};
