# Mini API Catalogue & Dashboard

API Node.js + Express pour gérer un catalogue de produits et catégories, avec un tableau de bord frontend pour la visualisation des données.

## Fonctionnalités

- **Backend**:
  - API RESTful pour les opérations CRUD sur les produits et catégories.
  - Persistance des données dans des fichiers JSON.
  - Système d'authentification basé sur les sessions.
  - Endpoints de statistiques pour l'analyse des données.
  - Validation robuste des entrées.
- **Frontend**:
  - Tableau de bord interactif pour visualiser les statistiques de ventes, produits et utilisateurs.
  - Graphiques dynamiques (ventes, répartition par catégorie, etc.).
  - Interface sécurisée avec page de connexion.
  - Mode clair / sombre.

## Installation

```bash
cd mini-api-catalogue
npm install
```

## Lancement

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`. Le tableau de bord est accessible à cette adresse après authentification.

Pour le développement avec rechargement automatique :

```bash
npm run dev
```

## Structure du Projet

```text
mini-api-catalogue/
├── data/
│   ├── categories.json
│   ├── products.json
│   ├── users.json
│   └── orders.json
├── public/
│   ├── index.html      # Tableau de bord principal
│   ├── auth.html       # Page de connexion
│   ├── script.js       # Logique du frontend
│   └── styles.css      # Styles
├── routes/
│   ├── auth.js         # Routes d'authentification
│   ├── categories.js   # Routes pour les catégories
│   ├── products.js     # Routes pour les produits
│   └── stats.js        # Routes pour les statistiques
├── server.js           # Point d'entrée du serveur Express
└── package.json
```

## API Endpoints

Toutes les routes, à l'exception de `/api/auth`, nécessitent une authentification.

### Authentification (`/api/auth`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Connecte un utilisateur |
| POST | `/logout` | Déconnecte l'utilisateur |
| GET | `/current`| Récupère l'utilisateur actuellement connecté |

### Catégories (`/api/categories`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste toutes les catégories |
| GET | `/:id` | Récupère une catégorie par son ID |
| POST | `/` | Crée une nouvelle catégorie |
| PUT | `/:id` | Met à jour une catégorie |
| DELETE | `/:id` | Supprime une catégorie |

### Produits (`/api/products`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste tous les produits |
| GET | `/:id` | Récupère un produit par son ID |
| POST | `/` | Crée un nouveau produit |
| PUT | `/:id` | Met à jour un produit |
| DELETE | `/:id` | Supprime un produit |

### Statistiques (`/api/stats`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/overview` | Statistiques générales (revenus, commandes, etc.) |
| GET | `/all-products` | Liste complète des produits avec nom de catégorie |
| GET | `/orders` | Liste des commandes |
| GET | `/users` | Liste des utilisateurs avec statistiques d'achat |
| ... | ... | Et d'autres routes pour les graphiques |

## Validation des Données

- **Catégories**: Le nom doit être une chaîne de caractères entre 2 et 100 caractères.
- **Produits**:
  - Le nom doit être une chaîne de caractères entre 2 et 100 caractères.
  - Le prix doit être un nombre positif.
  - `categoryId` doit correspondre à une catégorie existante.

## Tests Python (Fonctions Utilitaires)

Le projet inclut des tests unitaires pour des fonctions Python simples.

Lancer les tests :

```bash
python test.py        # Résumé
python test.py -v     # Détail
```

Résultat attendu : `Ran 10 tests ... OK`

## Collaboration GitHub

1. Créer une branche : `git checkout -b feature/<nom>`
2. Faire les modifications
3. Commit et push : `git add .` → `git commit -m "..."` → `git push origin feature/<nom>`
4. Créer une Pull Request sur GitHub (base: `main`)
5. Code review par le binôme
6. Merge si approuvé
7. Inverser les rôles

Nom des membres : Kouame Adamou Kevin
