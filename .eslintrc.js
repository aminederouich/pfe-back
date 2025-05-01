module.exports = {
	env: {
		node: true,
		browser: true,
		commonjs: true,
		es2021: true
	},
	settings: {
		react: {
			version: 'detect' // Laisse ESLint détecter la version
		}
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended'
	],
	parserOptions: {
		ecmaVersion: 2021, // Version explicite d'ECMAScript
		sourceType: 'module', // Utile si vous utilisez des imports/exports
		ecmaFeatures: {
			jsx: true // Support pour JSX
		}
	},
	plugins: [
		'react'
	],
	rules: {
		indent: ['error', 'space'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		'no-unused-vars': ['error', {
			vars: 'all',
			args: 'after-used',
			caughtErrors: 'all'
		}],
		'react/prop-types': 'off' // Désactive la vérification des PropTypes
	}
}
