module.exports = {
	env: {
		browser: true, // Pour le code qui s'exécute dans le navigateur
		es2021: true, // Pour ECMAScript 2021
		node: true // Pour le code qui s'exécute dans Node.js
	},
	extends: [
		'eslint:recommended', // Règles de base d'ESLint
		'plugin:react/recommended', // Règles recommandées pour React
		'plugin:prettier/recommended' // Intégration avec Prettier
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
	settings: {
		react: {
			version: 'detect' // Laisse ESLint détecter la version
		}
	},
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
