module.exports = {
	env: {
		'node': true,
		'browser': true,
		'commonjs': true,
		'es2021': true
	},
	settings: {
		react: {
			'version': '18.0' // Remplace par la version exacte si connue
		}
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended'
	],
	overrides: [
		{
			'env': {
				'node': true
			},
			'files': [
				'.eslintrc.{js,cjs}'
			],
			'parserOptions': {
				'sourceType': 'script'
			}
		}
	],
	parserOptions: {
		'ecmaVersion': 'latest'
	},
	plugins: [
		'react'
	],
	rules: {
		'indent': [
			'error',
			'tab'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'never'
		],
		'no-unused-vars': ['error', {
			'vars': 'all',
			'args': 'after-used',
			'caughtErrors': 'all'
		}]
	}
}
