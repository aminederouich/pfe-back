# API Documentation - Project Routes

## Overview

Cette documentation décrit les endpoints disponibles pour la gestion des projets dans l'application PFE Backend.

**Base URL:** `http://localhost:3000/project`

**Authentification:** Toutes les routes nécessitent un token JWT valide dans l'en-tête `Authorization: Bearer <token>`

---

## Endpoints

### 1. Récupérer tous les projets

**GET** `/project/getAllProject`

Récupère la liste de tous les projets disponibles.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Projects retrieved successfully",
  "data": [
    {
      "id": "project_id_1",
      "projectName": "Mon Projet",
      "key": "MP001",
      "projectType": "Software",
      "projectCategory": "Web Development",
      "projectLead": "John Doe"
    }
  ]
}
```

#### Réponses Erreur

- **401 Unauthorized**

```json
{
  "error": true,
  "message": "Authentication required"
}
```

- **500 Internal Server Error**

```json
{
  "error": true,
  "message": "Error message"
}
```

---

### 2. Ajouter un nouveau projet

**POST** `/project/addNewProject`

Crée un nouveau projet avec les informations fournies.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "projectName": "Mon Nouveau Projet",
  "key": "MNP001",
  "projectType": "Software",
  "projectCategory": "Mobile Development",
  "projectLead": "Jane Smith"
}
```

#### Paramètres Requis

| Paramètre         | Type   | Description           |
| ----------------- | ------ | --------------------- |
| `projectName`     | string | Nom du projet         |
| `key`             | string | Clé unique du projet  |
| `projectType`     | string | Type de projet        |
| `projectCategory` | string | Catégorie du projet   |
| `projectLead`     | string | Responsable du projet |

#### Réponse Succès (201)

```json
{
  "error": false,
  "message": "Project added successfully",
  "data": {
    "id": "generated_project_id",
    "projectName": "Mon Nouveau Projet",
    "key": "MNP001",
    "projectType": "Software",
    "projectCategory": "Mobile Development",
    "projectLead": "Jane Smith"
  }
}
```

#### Réponses Erreur

- **400 Bad Request** (Champs manquants)

```json
{
  "error": true,
  "message": "All fields are required"
}
```

- **400 Bad Request** (Clé existante)

```json
{
  "error": true,
  "message": "Project with this key already exists"
}
```

---

### 3. Supprimer des projets

**POST** `/project/deleteProjectByID`

Supprime un ou plusieurs projets en utilisant leurs identifiants.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "ids": ["project_id_1", "project_id_2"]
}
```

#### Paramètres Requis

| Paramètre | Type  | Description                             |
| --------- | ----- | --------------------------------------- |
| `ids`     | array | Tableau des IDs des projets à supprimer |

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Project deleted successfully"
}
```

#### Réponses Erreur

- **400 Bad Request**

```json
{
  "error": true,
  "message": "Project ID is required"
}
```

- **404 Not Found**

```json
{
  "error": true,
  "message": "Project not found"
}
```

---

### 4. Mettre à jour un projet

**POST** `/project/updateProjectByID`

Met à jour les informations d'un projet existant.

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body (JSON)

```json
{
  "projectId": "project_id_to_update",
  "projectData": {
    "projectName": "Nom Modifié",
    "key": "NM001",
    "projectType": "Hardware",
    "projectCategory": "IoT Development",
    "projectLead": "Bob Johnson"
  }
}
```

#### Paramètres Requis

| Paramètre                     | Type   | Description                   |
| ----------------------------- | ------ | ----------------------------- |
| `projectId`                   | string | ID du projet à mettre à jour  |
| `projectData`                 | object | Nouvelles données du projet   |
| `projectData.projectName`     | string | Nouveau nom du projet         |
| `projectData.key`             | string | Nouvelle clé du projet        |
| `projectData.projectType`     | string | Nouveau type de projet        |
| `projectData.projectCategory` | string | Nouvelle catégorie du projet  |
| `projectData.projectLead`     | string | Nouveau responsable du projet |

#### Réponse Succès (200)

```json
{
  "error": false,
  "message": "Project updated successfully"
}
```

#### Réponses Erreur

- **400 Bad Request**

```json
{
  "error": true,
  "message": "All fields are required"
}
```

- **404 Not Found**

```json
{
  "error": true,
  "message": "Project not found"
}
```

---

## Exemples d'utilisation

### JavaScript (Fetch API)

```javascript
// Récupérer tous les projets
const getAllProjects = async () => {
  const response = await fetch("http://localhost:3000/project/getAllProject", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
};

// Ajouter un nouveau projet
const addProject = async (projectData) => {
  const response = await fetch("http://localhost:3000/project/addNewProject", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  return await response.json();
};

// Supprimer des projets
const deleteProjects = async (projectIds) => {
  const response = await fetch(
    "http://localhost:3000/project/deleteProjectByID",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: projectIds }),
    }
  );
  return await response.json();
};

// Mettre à jour un projet
const updateProject = async (projectId, projectData) => {
  const response = await fetch(
    "http://localhost:3000/project/updateProjectByID",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, projectData }),
    }
  );
  return await response.json();
};
```

### cURL

```bash
# Récupérer tous les projets
curl -X GET http://localhost:3000/project/getAllProject \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Ajouter un nouveau projet
curl -X POST http://localhost:3000/project/addNewProject \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Mon Projet",
    "key": "MP001",
    "projectType": "Software",
    "projectCategory": "Web Development",
    "projectLead": "John Doe"
  }'

# Supprimer des projets
curl -X POST http://localhost:3000/project/deleteProjectByID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["project_id_1", "project_id_2"]}'

# Mettre à jour un projet
curl -X POST http://localhost:3000/project/updateProjectByID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project_id_to_update",
    "projectData": {
      "projectName": "Nom Modifié",
      "key": "NM001",
      "projectType": "Hardware",
      "projectCategory": "IoT Development",
      "projectLead": "Bob Johnson"
    }
  }'
```

---

## Modèle de Données

### Projet

```typescript
interface Project {
  id: string; // Généré automatiquement par Firebase
  projectName: string; // Nom du projet
  key: string; // Clé unique du projet
  projectType: string; // Type de projet
  projectCategory: string; // Catégorie du projet
  projectLead: string; // Responsable du projet
}
```

---

## Codes de Statut HTTP

| Code | Description                                          |
| ---- | ---------------------------------------------------- |
| 200  | Opération réussie                                    |
| 201  | Ressource créée avec succès                          |
| 400  | Requête invalide (données manquantes ou incorrectes) |
| 401  | Non autorisé (token manquant ou invalide)            |
| 404  | Ressource non trouvée                                |
| 500  | Erreur interne du serveur                            |

---

## Notes Importantes

1. **Authentification obligatoire** : Tous les endpoints nécessitent un token JWT valide
2. **Clé unique** : Chaque projet doit avoir une clé unique dans le système
3. **Suppression en lot** : L'endpoint de suppression accepte plusieurs IDs
4. **Validation** : Tous les champs sont requis lors de la création et modification
5. **Base de données** : Les données sont stockées dans Firebase Firestore

---

## Améliorations Suggérées

### 🔧 **Inconsistances API Détectées**

1. **Nommage non-REST** :

   - `getAllProject` → devrait être `GET /projects`
   - `addNewProject` → devrait être `POST /projects`
   - `deleteProjectByID` → devrait être `DELETE /projects/:id`
   - `updateProjectByID` → devrait être `PUT /projects/:id`

2. **Méthodes HTTP incorrectes** :
   - DELETE et UPDATE utilisent POST au lieu de DELETE/PUT
   - Inconsistant avec les standards REST

### 🛡️ **Sécurité et Authentification**

#### Format du JWT Token

```json
{
  "uid": "user_firebase_uid",
  "email": "user@example.com",
  "iat": 1625150400,
  "exp": 1625236800
}
```

#### Headers de Sécurité Recommandés

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

### 📊 **Limitation et Performance**

- **Rate Limiting** : Non implémenté (recommandé: 100 req/min par utilisateur)
- **Pagination** : Non disponible pour `getAllProject`
- **Filtrage** : Pas de paramètres de recherche/tri
- **Cache** : Aucune stratégie de mise en cache

### 🔍 **Validation Détaillée**

#### Règles de Validation

| Champ             | Règles                                     | Exemple            |
| ----------------- | ------------------------------------------ | ------------------ |
| `projectName`     | 3-100 caractères, alphanumérique + espaces | "Mon Projet Web"   |
| `key`             | 3-20 caractères, alphanumérique, unique    | "PROJ001"          |
| `projectType`     | Enum: Software, Hardware, Research         | "Software"         |
| `projectCategory` | 3-50 caractères                            | "Web Development"  |
| `projectLead`     | Email valide ou nom 3-50 caractères        | "john@example.com" |

### 📝 **Exemples d'Erreurs de Validation**

```json
// Validation échouée
{
  "error": true,
  "message": "Validation failed",
  "details": {
    "projectName": "Must be between 3 and 100 characters",
    "key": "Key already exists",
    "projectLead": "Must be a valid email"
  }
}
```

### 🛠️ **Outils de Test Supplémentaires**

#### Collection Postman

```json
{
  "info": { "name": "PFE Project API" },
  "auth": {
    "type": "bearer",
    "bearer": [{ "key": "token", "value": "{{jwt_token}}" }]
  }
}
```

#### Exemple Axios (React/Vue)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 🔄 **Recommandations Futures**

1. **Migrer vers REST standard** :

   ```
   GET    /api/v1/projects           # Liste tous
   POST   /api/v1/projects           # Créer nouveau
   GET    /api/v1/projects/:id       # Récupérer un
   PUT    /api/v1/projects/:id       # Mettre à jour
   DELETE /api/v1/projects/:id       # Supprimer un
   ```

2. **Ajouter pagination** :

   ```
   GET /api/v1/projects?page=1&limit=10&sort=name&order=asc
   ```

3. **Améliorer la validation** avec des schémas Joi/Yup

4. **Implémenter des webhooks** pour notifier les changements

5. **Ajouter un système de logs** pour l'audit

---

## Changelog

| Version | Date       | Description            |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2025-07-02 | Documentation initiale |
