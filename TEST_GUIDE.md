# Guide des Tests - Backend PFE

## 📊 Vue d'ensemble : 260 Tests

Ce projet contient une suite complète de **260 tests** couvrant tous les aspects du backend.

### Répartition des Tests

| Type de Test | Nombre | Description |
|--------------|--------|-------------|
| **Tests Unitaires** | 140 | Tests isolés des fonctions individuelles |
| **Tests d'Intégration** | 80 | Tests des interactions entre composants |
| **Tests Fonctionnels/API** | 30 | Tests des endpoints complets |
| **Tests E2E** | 10 | Tests de workflows complets |
| **TOTAL** | **260** | |

---

## 🧪 Types de Tests Détaillés

### 1. Tests Unitaires (140 tests)

#### Services (60 tests)
- `test/unit/auth.service.unit.test.js` - 12 tests
  - Inscription, connexion, déconnexion
  - Réinitialisation mot de passe
  - Vérification token JWT
  
- `test/unit/score.service.unit.test.js` - 15 tests
  - Calcul de scores (single et multiple)
  - Application des règles (priorité, type, deadline)
  - Récupération des scores
  
- `test/unit/ticket.service.unit.test.js` - 10 tests
  - Synchronisation avec Firebase
  - Opérations Jira (recherche, mise à jour, transition)
  
- `test/unit/weeklyScore.service.unit.test.js` - 10 tests
  - Traitement des scores hebdomadaires
  - Génération du classement top 3
  - Envoi d'emails
  
- `test/unit/jiraConfig.service.unit.test.js` - 4 tests
- `test/unit/project.service.unit.test.js` - 4 tests

#### Controllers (40 tests)
- `test/unit/auth.controller.unit.test.js` - 8 tests
- `test/unit/user.controller.unit.test.js` - 6 tests
- `test/unit/score.controller.unit.test.js` - 8 tests
- `test/unit/ticket.controller.unit.test.js` - 8 tests
- `test/unit/rules.controller.unit.test.js` - 4 tests
- `test/unit/project.controller.unit.test.js` - 6 tests

#### Models, Utils, Middleware (40 tests)
- `test/unit/models.unit.test.js` - 20 tests
  - User, Ticket, Score, TicketScore, Rules, Project models
  
- `test/unit/utils-middleware.unit.test.js` - 20 tests
  - Email utilities (5 tests)
  - Score deadline calculations (5 tests)
  - Auth middleware (5 tests)
  - Jira client middleware (5 tests)

---

### 2. Tests d'Intégration (80 tests)

#### Auth Flow (15 tests)
`test/integration/auth.integration.test.js`
- Flux complet d'inscription/connexion
- Gestion des erreurs et validations
- Tests de concurrence

#### Score & Rules Flow (20 tests)
`test/integration/score.integration.test.js`
- Calcul de scores avec règles complètes
- Tests de performance
- Agrégation des scores

#### User & Project Flow (20 tests)
`test/integration/user-project.integration.test.js`
- Gestion des utilisateurs
- CRUD projets
- Invitation d'utilisateurs

#### Ticket & Jira Flow (25 tests)
`test/integration/ticket-jira.integration.test.js`
- Synchronisation Jira ↔ Firebase
- Transitions de statut
- Gestion des erreurs API Jira

---

### 3. Tests Fonctionnels/API (30 tests)

`test/functional/api.functional.test.js`

Tous les endpoints testés avec SuperTest :
- **Auth** (5 tests) : `/auth/*`
- **User** (5 tests) : `/user/*`
- **Project** (5 tests) : `/project/*`
- **Score** (5 tests) : `/scores/*`
- **Rules** (3 tests) : `/rules/*`
- **Jira Config** (2 tests) : `/jira_config/*`
- **Weekly Scores** (2 tests) : `/weeklyscores/*`
- **Ticket** (3 tests) : `/ticket/*`

---

### 4. Tests E2E (10 tests)

`test/e2e/complete-workflows.e2e.test.js`

Workflows complets testés :
1. Onboarding utilisateur complet
2. Configuration projet + Jira
3. Création de règles de scoring
4. Synchronisation tickets Jira
5. Calcul de scores automatique
6. Mise à jour tickets et recalcul
7. Transitions de workflow
8. Rapports et analytics
9. Gestion d'équipe
10. Nettoyage des données

---

## 🚀 Commandes de Test

```powershell
# Lancer tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests d'un dossier spécifique
npm test -- test/unit
npm test -- test/integration
npm test -- test/functional
npm test -- test/e2e

# Tests d'un fichier spécifique
npm test -- test/unit/auth.service.unit.test.js

# Tests avec verbose
npm test -- --verbose

# Tests avec pattern
npm test -- --testNamePattern="should login"
```

---

## 📁 Structure des Fichiers de Test

```
test/
├── helpers/
│   ├── setup.js              # Configuration globale Jest
│   └── mockData.js            # Données de test réutilisables
│
├── unit/                      # Tests unitaires (140)
│   ├── auth.service.unit.test.js
│   ├── score.service.unit.test.js
│   ├── ticket.service.unit.test.js
│   ├── weeklyScore.service.unit.test.js
│   ├── jiraConfig.service.unit.test.js
│   ├── project.service.unit.test.js
│   ├── auth.controller.unit.test.js
│   ├── user.controller.unit.test.js
│   ├── score.controller.unit.test.js
│   ├── ticket.controller.unit.test.js
│   ├── rules.controller.unit.test.js
│   ├── project.controller.unit.test.js
│   ├── models.unit.test.js
│   └── utils-middleware.unit.test.js
│
├── integration/               # Tests d'intégration (80)
│   ├── auth.integration.test.js
│   ├── score.integration.test.js
│   ├── user-project.integration.test.js
│   └── ticket-jira.integration.test.js
│
├── functional/                # Tests fonctionnels (30)
│   └── api.functional.test.js
│
└── e2e/                       # Tests E2E (10)
    └── complete-workflows.e2e.test.js

__mocks__/                     # Mocks globaux
├── firebase/
│   ├── auth.js
│   └── firestore.js
├── config/
│   └── firebase.js
├── jira-client.js
├── nodemailer.js
└── node-cron.js
```

---

## 🎯 Objectifs de Coverage

| Métrique | Objectif | Description |
|----------|----------|-------------|
| Branches | 70% | Couverture des branches conditionnelles |
| Functions | 75% | Couverture des fonctions |
| Lines | 75% | Couverture des lignes de code |
| Statements | 75% | Couverture des instructions |

---

## 🔧 Mocks et Fixtures

### Mocks Disponibles
- **Firebase Auth** : Simule l'authentification Firebase
- **Firebase Firestore** : Simule la base de données Firestore
- **Jira Client** : Simule les appels API Jira
- **Nodemailer** : Simule l'envoi d'emails
- **node-cron** : Simule les tâches planifiées

### Mock Data (`test/helpers/mockData.js`)
- `mockUser` : Utilisateur de test
- `mockTicket` : Ticket Jira de test
- `mockRule` : Règle de scoring de test
- `mockProject` : Projet de test
- `mockJiraConfig` : Configuration Jira de test
- `mockScore` : Score de test
- `mockWeeklyLeaderboard` : Classement hebdomadaire de test

---

## 📝 Bonnes Pratiques

### 1. Isolation des Tests
- Chaque test doit être indépendant
- Utiliser `beforeEach` pour réinitialiser les mocks
- Ne pas dépendre de l'ordre d'exécution

### 2. Nommage des Tests
```javascript
describe('ServiceName - Unit Tests', () => {
  describe('methodName', () => {
    it('should do something when condition', async () => {
      // Test
    });
  });
});
```

### 3. AAA Pattern
```javascript
it('should return user when valid ID', async () => {
  // Arrange
  const userId = 'test-123';
  User.findById.mockResolvedValue(mockUser);
  
  // Act
  const result = await userService.getUser(userId);
  
  // Assert
  expect(result).toEqual(mockUser);
});
```

### 4. Tests Asynchrones
```javascript
// ✅ Bon
it('should handle async operation', async () => {
  await expect(service.method()).resolves.toBeDefined();
});

// ❌ Mauvais
it('should handle async operation', () => {
  service.method(); // Oubli du await
});
```

---

## 🐛 Debugging des Tests

### Exécuter un seul test
```powershell
npm test -- -t "should login user successfully"
```

### Voir les logs détaillés
```powershell
npm test -- --verbose --no-coverage
```

### Mode debug
```powershell
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📊 Génération de Rapports

Les rapports de coverage sont générés dans le dossier `coverage/` :

- **HTML** : `coverage/lcov-report/index.html` (ouvrir dans un navigateur)
- **JSON** : `coverage/coverage-final.json`
- **LCOV** : `coverage/lcov.info`
- **Clover** : `coverage/clover.xml`

---

## ✅ Checklist Avant Commit

- [ ] Tous les tests passent : `npm test`
- [ ] Coverage > 75% : `npm run test:coverage`
- [ ] Pas de console.log/error dans le code
- [ ] Mocks nettoyés après chaque test
- [ ] Tests nommés clairement
- [ ] Pas de tests désactivés (`.skip` ou `.only`)

---

## 🔄 CI/CD Integration

Les tests sont automatiquement exécutés lors :
- Des push sur les branches
- Des pull requests
- Des releases

Configuration dans `.github/workflows/test.yml` (si applicable)

---

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [SuperTest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🎉 Statistiques Finales

- **260 tests** au total
- **Coverage cible : 75%+**
- **Temps d'exécution : ~30-60 secondes**
- **Tous les endpoints couverts**
- **Tous les services testés**

---

**Dernière mise à jour** : Novembre 2025
