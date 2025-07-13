module.exports = {
  env: {
    es2021: true, // Pour ECMAScript 2021
    node: true, // Pour le code qui s'exécute dans Node.js
    jest: true, // Pour les tests Jest
  },
  extends: [
    'eslint:recommended', // Règles de base d'ESLint
  ],
  parserOptions: {
    ecmaVersion: 2021, // Version explicite d'ECMAScript
    sourceType: 'module', // Utile si vous utilisez des imports/exports
  },
  rules: {
    // Code Quality Rules
    indent: ['error', 2], // Use 2 spaces for indentation
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        caughtErrors: 'all',
        ignoreRestSiblings: true,
      },
    ],

    // Best Practices
    'no-console': 'warn', // Avertir pour les console.log
    'no-debugger': 'error', // Interdire debugger
    'no-alert': 'error', // Interdire alert, confirm, prompt
    'no-eval': 'error', // Interdire eval()
    'no-implied-eval': 'error', // Interdire eval() implicite
    'no-with': 'error', // Interdire with statement
    'no-new-func': 'error', // Interdire new Function()
    'no-return-await': 'error', // Éviter return await inutile
    'prefer-const': 'error', // Préférer const quand possible
    'no-var': 'error', // Interdire var, utiliser let/const
    'prefer-arrow-callback': 'error', // Préférer arrow functions
    'arrow-spacing': 'error', // Espaces autour des flèches
    'prefer-template': 'error', // Préférer template literals

    // Error Prevention
    'no-undef': 'error', // Variables non définies
    'no-unused-expressions': 'error', // Expressions inutilisées
    'no-unreachable': 'error', // Code inaccessible
    'no-duplicate-case': 'error', // Cases dupliqués dans switch
    'no-empty': 'error', // Blocs vides
    'no-extra-semi': 'error', // Points-virgules supplémentaires
    'no-func-assign': 'error', // Réassignation de fonctions
    'no-invalid-regexp': 'error', // RegExp invalides
    'no-irregular-whitespace': 'error', // Espaces irréguliers
    'use-isnan': 'error', // Utiliser isNaN() pour vérifier NaN

    // Code Style
    'brace-style': ['error', '1tbs'], // Style des accolades
    'comma-dangle': ['error', 'always-multiline'], // Virgules finales
    'comma-spacing': ['error', { before: false, after: true }], // Espaces autour des virgules
    'comma-style': ['error', 'last'], // Style des virgules
    'computed-property-spacing': ['error', 'never'], // Espaces dans les propriétés calculées
    'eol-last': 'error', // Ligne vide à la fin du fichier
    'key-spacing': ['error', { beforeColon: false, afterColon: true }], // Espaces autour des deux-points
    'keyword-spacing': 'error', // Espaces autour des mots-clés
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }], // Lignes vides multiples
    'no-trailing-spaces': 'error', // Espaces en fin de ligne
    'object-curly-spacing': ['error', 'always'], // Espaces dans les objets
    'space-before-blocks': 'error', // Espace avant les blocs
    'space-before-function-paren': ['error', 'never'], // Espace avant parenthèses de fonction
    'space-in-parens': ['error', 'never'], // Espaces dans les parenthèses
    'space-infix-ops': 'error', // Espaces autour des opérateurs

    // Node.js specific
    'no-process-exit': 'error', // Éviter process.exit()
    'no-path-concat': 'error', // Éviter concaténation de chemins
    'handle-callback-err': 'error', // Gérer les erreurs de callback

    // ES6+ Features
    'prefer-destructuring': ['error', {
      array: true,
      object: true,
    }, {
      enforceForRenamedProperties: false,
    }],
    'object-shorthand': 'error', // Propriétés raccourcies d'objets
    'prefer-rest-params': 'error', // Préférer rest params à arguments
    'prefer-spread': 'error', // Préférer spread operator
    'template-curly-spacing': 'error', // Espaces dans les template literals

    // Security
    'no-script-url': 'error', // Éviter javascript: URLs

    // Complexity
    'complexity': ['warn', 10], // Complexité cyclomatique
    'max-depth': ['warn', 4], // Profondeur maximale d'imbrication
    'max-lines': ['warn', 300], // Nombre maximum de lignes par fichier
    'max-params': ['warn', 4], // Nombre maximum de paramètres

    // Additional Best Practices
    'eqeqeq': ['error', 'always'], // Toujours utiliser === et !==
    'curly': ['error', 'all'], // Toujours utiliser des accolades
    'default-case': 'error', // Case par défaut dans switch
    'dot-notation': 'error', // Préférer dot notation
    'guard-for-in': 'error', // Vérifier hasOwnProperty dans for-in
    'no-else-return': 'error', // Éviter else après return
    'no-empty-function': 'error', // Éviter les fonctions vides
    'no-magic-numbers': ['warn', {
      ignore: [-1, 0, 1, 2, 4, 10, 100, 300, 1000],
      ignoreArrayIndexes: true,
      enforceConst: true,
    }], // Éviter les nombres magiques
    'no-multi-spaces': 'error', // Éviter les espaces multiples
    'no-nested-ternary': 'error', // Éviter les ternaires imbriqués
    'no-useless-return': 'error', // Éviter les return inutiles
    'prefer-promise-reject-errors': 'error', // Rejeter avec des Error objects
    'radix': 'error', // Spécifier la base pour parseInt
    'yoda': 'error', // Éviter les conditions Yoda
  },
};
