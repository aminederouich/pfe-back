# API Documentation - Jira Configuration Routes

## Overview

Cette documentation décrit les endpoints disponibles pour la gestion des configurations Jira dans l'application PFE Backend.

**Base URL:** `http://localhost:3000/jira_config`

**Authentification:** Toutes les routes nécessitent un token JWT valide dans l'en-tête `Authorization: Bearer <token>`

---

## Endpoints

### 1. Tester la connexion Jira

**POST** `/jira_config/checkConnection`

Teste la connexion à une instance Jira avec les paramètres fournis.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "protocol": "https",
  "host": "your-domain.atlassian.net",
  "username": "your-email@domain.com",
  "password": "your-api-token",
  "apiVersion": "2",
  "strictSSL": true
}
```

#### Paramètres Requis

| Paramètre    | Type    | Description                   |
| ------------ | ------- | ----------------------------- |
| `protocol`   | string  | Protocole ('http' ou 'https') |
| `host`       | string  | Domaine de l'instance Jira    |
| `username`   | string  | Nom d'utilisateur ou email    |
| `password`   | string  | Mot de passe ou token API     |
| `apiVersion` | string  | Version de l'API Jira         |
| `strictSSL`  | boolean | Validation SSL stricte        |

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Connection successful",
  "data": {
    "accountId": "5b10a2844c20165700ede21g",
    "displayName": "John Doe",
    "emailAddress": "john@domain.com"
  }
}
```

#### Réponses Erreur

- **400 Bad Request** (Paramètres manquants)

```json
{
  "error": true,
  "message": "All connection parameters are required"
}
```

- **422 Unprocessable Entity** (Connexion échouée)

```json
{
  "error": true,
  "message": "Connection failed: Invalid credentials"
}
```

---

### 2. Récupérer toutes les configurations

**GET** `/jira_config/getAllConfig`

Récupère la liste de toutes les configurations Jira.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Jira client configuration retrieved successfully",
  "data": [
    {
      "id": "config_id_1",
      "protocol": "https",
      "host": "company.atlassian.net",
      "username": "admin@company.com",
      "password": "********",
      "apiVersion": "2",
      "strictSSL": true,
      "enableConfig": true
    }
  ]
}
```

---

### 3. Récupérer les configurations activées

**GET** `/jira_config/getEnabledConfig`

Récupère uniquement les configurations Jira activées.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Enabled Jira client configurations retrieved successfully",
  "data": [
    {
      "id": "config_id_1",
      "protocol": "https",
      "host": "company.atlassian.net",
      "username": "admin@company.com",
      "password": "********",
      "apiVersion": "2",
      "strictSSL": true,
      "enableConfig": true
    }
  ]
}
```

---

### 4. Récupérer une configuration par ID

**GET** `/jira_config/getConfig/:id`

Récupère une configuration Jira spécifique par son ID.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Paramètres URL

| Paramètre | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | string | ID de la configuration |

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Jira client configuration retrieved successfully",
  "data": {
    "id": "config_id_1",
    "protocol": "https",
    "host": "company.atlassian.net",
    "username": "admin@company.com",
    "password": "********",
    "apiVersion": "2",
    "strictSSL": true,
    "enableConfig": true
  }
}
```

#### Réponses Erreur

- **404 Not Found**

```json
{
  "error": true,
  "message": "Jira configuration not found"
}
```

---

### 5. Ajouter une nouvelle configuration

**POST** `/jira_config/addConfig`

Crée une nouvelle configuration Jira.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "protocol": "https",
  "host": "new-company.atlassian.net",
  "username": "admin@new-company.com",
  "password": "api-token-here",
  "apiVersion": "2",
  "strictSSL": true,
  "enableConfig": true
}
```

#### Paramètres Requis

| Paramètre      | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| `protocol`     | string  | Protocole ('http' ou 'https')               |
| `host`         | string  | Domaine de l'instance Jira (unique)         |
| `username`     | string  | Nom d'utilisateur (min 3 caractères)        |
| `password`     | string  | Mot de passe/token (min 6 caractères)       |
| `apiVersion`   | string  | Version de l'API Jira                       |
| `strictSSL`    | boolean | Validation SSL stricte                      |
| `enableConfig` | boolean | État d'activation (optionnel, défaut: true) |

#### Réponse Succès (201)

```json
{
  "error": false,
  "message": "Jira client configuration added successfully",
  "data": {
    "id": "generated_config_id",
    "protocol": "https",
    "host": "new-company.atlassian.net",
    "username": "admin@new-company.com",
    "password": "api-token-here",
    "apiVersion": "2",
    "strictSSL": true,
    "enableConfig": true
  }
}
```

#### Réponses Erreur

- **400 Bad Request** (Validation échouée)

```json
{
  "error": true,
  "message": "Validation failed",
  "details": {
    "host": "Invalid host format",
    "username": "Username must be at least 3 characters",
    "password": "Password must be at least 6 characters"
  }
}
```

- **400 Bad Request** (Host existant)

```json
{
  "error": true,
  "message": "Configuration already exists for this host"
}
```

---

### 6. Supprimer des configurations

**POST** `/jira_config/deleteConfigByID`

Supprime une ou plusieurs configurations Jira.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "ids": ["config_id_1", "config_id_2"]
}
```

#### Paramètres Requis

| Paramètre | Type  | Description                                    |
| --------- | ----- | ---------------------------------------------- |
| `ids`     | array | Tableau des IDs des configurations à supprimer |

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Jira client configuration deleted successfully"
}
```

#### Réponses Erreur

- **400 Bad Request**

```json
{
  "error": true,
  "message": "Array of IDs is required"
}
```

---

### 7. Mettre à jour une configuration

**POST** `/jira_config/updateConfigByID`

Met à jour une configuration Jira existante.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "id": "config_id_to_update",
  "protocol": "https",
  "host": "updated-company.atlassian.net",
  "username": "new-admin@company.com",
  "password": "new-api-token",
  "apiVersion": "2",
  "strictSSL": false,
  "enableConfig": false
}
```

#### Paramètres Requis

| Paramètre      | Type    | Description                            |
| -------------- | ------- | -------------------------------------- |
| `id`           | string  | ID de la configuration à mettre à jour |
| `protocol`     | string  | Nouveau protocole                      |
| `host`         | string  | Nouveau domaine                        |
| `username`     | string  | Nouveau nom d'utilisateur              |
| `password`     | string  | Nouveau mot de passe/token             |
| `apiVersion`   | string  | Nouvelle version API                   |
| `strictSSL`    | boolean | Nouvelle validation SSL                |
| `enableConfig` | boolean | Nouvel état d'activation               |

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Jira client configuration updated successfully",
  "data": {
    "id": "config_id_to_update",
    "protocol": "https",
    "host": "updated-company.atlassian.net",
    "username": "new-admin@company.com",
    "password": "new-api-token",
    "apiVersion": "2",
    "strictSSL": false,
    "enableConfig": false
  }
}
```

#### Réponses Erreur

- **400 Bad Request** (Validation échouée)

```json
{
  "error": true,
  "message": "Validation failed",
  "details": {
    "protocol": "Protocol must be 'http' or 'https'"
  }
}
```

- **404 Not Found**

```json
{
  "error": true,
  "message": "Jira configuration not found"
}
```

---

## Exemples d'utilisation

### JavaScript (Fetch API)

```javascript
// Tester une connexion Jira
const testConnection = async (configData) => {
  const response = await fetch(
    "http://localhost:3000/jira_config/checkConnection",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configData),
    }
  );
  return await response.json();
};

// Récupérer toutes les configurations
const getAllConfigs = async () => {
  const response = await fetch(
    "http://localhost:3000/jira_config/getAllConfig",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await response.json();
};

// Ajouter une nouvelle configuration
const addConfig = async (configData) => {
  const response = await fetch("http://localhost:3000/jira_config/addConfig", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configData),
  });
  return await response.json();
};

// Supprimer des configurations
const deleteConfigs = async (configIds) => {
  const response = await fetch(
    "http://localhost:3000/jira_config/deleteConfigByID",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: configIds }),
    }
  );
  return await response.json();
};

// Mettre à jour une configuration
const updateConfig = async (id, configData) => {
  const response = await fetch(
    "http://localhost:3000/jira_config/updateConfigByID",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...configData }),
    }
  );
  return await response.json();
};
```

### cURL

```bash
# Tester une connexion
curl -X POST http://localhost:3000/jira_config/checkConnection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "https",
    "host": "company.atlassian.net",
    "username": "admin@company.com",
    "password": "api-token",
    "apiVersion": "2",
    "strictSSL": true
  }'

# Récupérer toutes les configurations
curl -X GET http://localhost:3000/jira_config/getAllConfig \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Ajouter une configuration
curl -X POST http://localhost:3000/jira_config/addConfig \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "https",
    "host": "new-company.atlassian.net",
    "username": "admin@new-company.com",
    "password": "api-token-here",
    "apiVersion": "2",
    "strictSSL": true,
    "enableConfig": true
  }'
```

---

## Modèle de Données

### Configuration Jira

```typescript
interface JiraConfig {
  id: string; // Généré automatiquement par Firebase
  protocol: string; // 'http' ou 'https'
  host: string; // Domaine Jira (unique)
  username: string; // Nom d'utilisateur/email
  password: string; // Mot de passe/token API
  apiVersion: string; // Version de l'API Jira
  strictSSL: boolean; // Validation SSL stricte
  enableConfig: boolean; // État d'activation
}
```

---

## Règles de Validation

| Champ          | Règles                        | Exemple                 |
| -------------- | ----------------------------- | ----------------------- |
| `protocol`     | Enum: 'http', 'https'         | "https"                 |
| `host`         | Format domaine valide, unique | "company.atlassian.net" |
| `username`     | Min 3 caractères              | "admin@company.com"     |
| `password`     | Min 6 caractères              | "api-token-123"         |
| `apiVersion`   | Requis, généralement "2"      | "2"                     |
| `strictSSL`    | Boolean requis                | true                    |
| `enableConfig` | Boolean, défaut: true         | true                    |

---

## Codes de Statut HTTP

| Code | Description                            |
| ---- | -------------------------------------- |
| 200  | Opération réussie                      |
| 201  | Configuration créée avec succès        |
| 400  | Requête invalide (validation échouée)  |
| 401  | Non autorisé (token manquant/invalide) |
| 404  | Configuration non trouvée              |
| 422  | Erreur de connexion Jira               |
| 500  | Erreur interne du serveur              |

---

## Sécurité

### Considérations importantes

1. **Stockage des mots de passe** : Les tokens API sont stockés en clair (⚠️ À améliorer)
2. **Validation des domaines** : Seuls les domaines valides sont acceptés
3. **Test de connexion** : Validation automatique lors de l'ajout
4. **Authentification** : Tous les endpoints nécessitent un JWT valide

### Recommandations

- Chiffrer les mots de passe/tokens avant stockage
- Implémenter une rotation automatique des tokens
- Ajouter des logs d'audit pour les modifications
- Limiter les tentatives de connexion

---

## Architecture Appliquée

Cette API suit l'architecture en couches :

```
Routes (jira_config.js)
    ↓
Controller (jiraConfig.controller.js)
    ↓
Service (jiraConfig.service.js)
    ↓
Model (jiraConfig.model.js)
    ↓
Firebase Firestore
```

### Améliorations apportées

✅ **Séparation des responsabilités** - Service et Model créés
✅ **Validation robuste** - Validation métier dans le service
✅ **Gestion d'erreurs** - Messages d'erreur appropriés
✅ **Routes supplémentaires** - getById et getEnabled ajoutées
✅ **Test de connexion amélioré** - Retour d'informations utilisateur

---

## Changelog

| Version | Date       | Description                                      |
| ------- | ---------- | ------------------------------------------------ |
| 2.0.0   | 2025-07-02 | Refactoring complet avec architecture en couches |
| 1.0.0   | 2025-07-02 | Version initiale                                 |
