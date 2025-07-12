# Tests d'Authentification

## Vue d'ensemble

Ce dossier contient une suite complète de tests pour les routes d'authentification de l'application. Les tests sont organisés en plusieurs fichiers pour couvrir différents aspects du système d'authentification.

## Structure des Tests

### 1. `auth.routes.test.js` - Tests d'Intégration des Routes
**Objectif :** Tester les routes d'authentification avec des mocks des services
**Couverture :**
- Tests de toutes les routes d'authentification
- Validation des réponses HTTP
- Gestion des erreurs et cas limites
- Vérification des codes de statut appropriés

### 2. `auth.controller.test.js` - Tests Unitaires du Contrôleur
**Objectif :** Tester les fonctions du contrôleur d'authentification de manière isolée
**Couverture :**
- Tests unitaires de chaque fonction du contrôleur
- Validation de la logique métier
- Gestion des erreurs spécifiques
- Tests des middlewares d'authentification

### 3. `auth.integration.test.js` - Tests d'Intégration Simplifiés
**Objectif :** Tests d'intégration avec une approche plus directe
**Couverture :**
- Tests de bout en bout des routes
- Validation des flux complets
- Tests des interactions entre composants

### 4. `auth.routes.config.test.js` - Tests de Configuration des Routes
**Objectif :** Valider la configuration et la structure des routes
**Couverture :**
- Vérification des routes définies
- Validation des méthodes HTTP
- Tests des middlewares appliqués
- Validation de la structure des routes

### 5. `auth.validation.test.js` - Tests de Validation des Données
**Objectif :** Tester la validation des données d'entrée
**Couverture :**
- Validation des formats d'email
- Tests des mots de passe
- Gestion des données manquantes
- Tests des cas limites et caractères spéciaux

## Routes Testées

### POST /auth/signup
- Inscription d'un nouvel utilisateur
- Validation des champs requis (email, password, firstName, lastName)
- Gestion des erreurs (email existant, données invalides)

### POST /auth/signin
- Connexion d'un utilisateur
- Validation des identifiants
- Gestion des tentatives de connexion
- Codes d'erreur spécifiques (401, 422, 429, 404)

### GET /auth/check-auth
- Vérification de l'authentification
- Middleware d'authentification requis
- Retour des informations utilisateur

### POST /auth/logout
- Déconnexion d'un utilisateur
- Middleware d'authentification requis
- Nettoyage des tokens

### POST /auth/forget-password
- Envoi d'email de réinitialisation
- Validation de l'email
- Gestion des erreurs de service

### POST /auth/verify-email
- Envoi d'email de vérification
- Gestion des erreurs de vérification

## Exécution des Tests

### Tous les tests d'authentification
```bash
npm run test:auth
```

### Tests en mode watch (développement)
```bash
npm run test:auth:watch
```

### Tests avec couverture de code
```bash
npm run test:auth:coverage
```

### Tests spécifiques
```bash
# Tests d'intégration des routes
npx jest test/auth.routes.test.js

# Tests unitaires du contrôleur
npx jest test/auth.controller.test.js

# Tests de validation
npx jest test/auth.validation.test.js
```

## Mocks et Dépendances

### Services Mockés
- `AuthService` : Service d'authentification principal
- `authMiddleware` : Middleware d'authentification

### Bibliothèques Utilisées
- **Jest** : Framework de test
- **Supertest** : Tests d'API HTTP
- **Express** : Application de test

## Cas de Test Couverts

### Cas de Succès
✅ Inscription réussie avec données valides
✅ Connexion réussie avec identifiants corrects
✅ Vérification d'authentification valide
✅ Déconnexion réussie
✅ Envoi d'email de réinitialisation
✅ Envoi d'email de vérification

### Cas d'Erreur
❌ Données manquantes ou invalides
❌ Identifiants incorrects
❌ Utilisateur non trouvé
❌ Trop de tentatives de connexion
❌ Erreurs de service
❌ Problèmes d'authentification

### Cas Limites
🔍 Emails très longs
🔍 Caractères spéciaux
🔍 Types de données incorrects
🔍 Corps de requête malformés
🔍 Valeurs null et undefined

## Codes de Statut HTTP Testés

- **200** : Succès (connexion, vérification, etc.)
- **201** : Création réussie (inscription)
- **400** : Erreur de validation/service
- **401** : Non autorisé (identifiants incorrects)
- **404** : Utilisateur non trouvé
- **422** : Données requises manquantes
- **429** : Trop de tentatives
- **500** : Erreur serveur

## Bonnes Pratiques Implémentées

1. **Isolation des Tests** : Chaque test est indépendant
2. **Mocks Appropriés** : Services externes mockés
3. **Nettoyage** : `beforeEach` et `afterEach` pour reset
4. **Assertions Claires** : Messages d'erreur explicites
5. **Couverture Complète** : Tous les chemins de code testés
6. **Tests de Configuration** : Validation de la structure des routes

## Maintenance des Tests

Pour maintenir ces tests :

1. **Ajouter de nouveaux tests** lors de l'ajout de nouvelles routes
2. **Mettre à jour les mocks** si les services changent
3. **Vérifier la couverture** régulièrement
4. **Maintenir la documentation** à jour

## Contribution

Lors de l'ajout de nouvelles fonctionnalités d'authentification :

1. Ajouter les tests correspondants dans le fichier approprié
2. Mettre à jour cette documentation
3. Vérifier que tous les tests passent
4. Maintenir une couverture de code élevée
