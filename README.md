# Système de Gestion Commerciale

Application web complète pour la gestion d'un commerce de vente d'articles de mode.

## Structure du Projet

Le projet est divisé en deux parties principales :
- `backend/` : API Laravel
- `frontend/` : Application Vue.js

## Prérequis

- PHP >= 8.1
- Composer
- Node.js >= 16
- MySQL >= 8.0
- npm ou yarn

## Installation Backend (Laravel)

1. Cloner le repository
2. Naviguer vers le dossier backend :
```bash
cd backend
```

3. Installer les dépendances :
```bash
composer install
```

4. Copier le fichier .env :
```bash
cp .env.example .env
```

5. Configurer la base de données dans .env

6. Générer la clé d'application :
```bash
php artisan key:generate
```

7. Exécuter les migrations :
```bash
php artisan migrate
```

8. Lancer le serveur :
```bash
php artisan serve
```

## Installation Frontend (Vue.js)

1. Naviguer vers le dossier frontend :
```bash
cd frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Copier le fichier .env :
```bash
cp .env.example .env
```

4. Configurer l'URL de l'API dans .env

5. Lancer le serveur de développement :
```bash
npm run dev
```

## Fonctionnalités

### Admin
- Gestion des produits
- Gestion des ventes
- Gestion des utilisateurs
- Gestion des fournisseurs
- Statistiques de ventes
- Export de rapports

### Vendeur
- Création de ventes
- Consultation de ses transactions
- Statistiques personnelles

## Technologies Utilisées

### Backend
- Laravel 10
- Laravel Sanctum
- MySQL
- PHPUnit pour les tests

### Frontend
- Vue.js 3
- Vue Router
- Pinia
- TailwindCSS
- Axios 