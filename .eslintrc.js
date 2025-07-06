module.exports = {
  env: {
    es2021: true, // Pour ECMAScript 2021
    node: true, // Pour le code qui s'exécute dans Node.js
  },
  extends: [
    'eslint:recommended', // Règles de base d'ESLint
  ],
  parserOptions: {
    ecmaVersion: 2021, // Version explicite d'ECMAScript
    sourceType: 'module', // Utile si vous utilisez des imports/exports
  },
  rules: {
    indent: ['error', 2], // Use 2 spaces for indentation
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        caughtErrors: 'all',
      },
    ],
  },
};
