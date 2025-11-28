# 📦 Guide d'Installation - Gestion de Stock Mabel

## 🎯 Installation sur PC Windows (Sans serveur)

Ce guide explique comment installer l'application de gestion de stock sur un PC Windows pour une utilisation locale.

---

## ⚙️ Prérequis à Télécharger

### 1. **Laragon** (Serveur Local - TOUT-EN-UN)
- 📥 **Télécharger** : https://laragon.org/download/
- ✅ Version recommandée : **Laragon Full (PHP 8.2 + MySQL + Node.js)**
- 📦 Taille : ~200 MB
- ⏱️ Installation : 5 minutes

**Pourquoi Laragon ?**
- ✅ Inclut PHP, MySQL, Node.js automatiquement
- ✅ Interface simple en français
- ✅ Pas besoin de configuration compliquée

---

## 📋 Étapes d'Installation

### **ÉTAPE 1 : Installer Laragon**

1. **Télécharger** Laragon Full depuis le lien ci-dessus
2. **Exécuter** le fichier `.exe` téléchargé
3. **Suivre l'assistant** d'installation :
   - Installer dans : `C:\laragon` (par défaut)
   - Cocher : ✅ PHP, ✅ MySQL, ✅ Node.js
4. **Lancer Laragon** après l'installation
5. Cliquer sur **"Démarrer tout"** (Start All)

> ✅ **Vérification** : Les icônes MySQL et Apache doivent être vertes

---

### **ÉTAPE 2 : Copier les Fichiers de l'Application**

1. **Copier le dossier du projet** dans : `C:\laragon\www\`
   ```
   C:\laragon\www\MabelProject\
   ```

2. Vous devez avoir cette structure :
   ```
   C:\laragon\www\MabelProject\
   ├── backend/          ← Code Laravel (PHP)
   ├── FrontendReact/    ← Interface (React)
   └── INSTALLATION.md   ← Ce fichier
   ```

---

### **ÉTAPE 3 : Configurer la Base de Données**

#### A. Créer la base de données

1. **Ouvrir Laragon** → Clic droit → **MySQL** → **Open**
2. Dans la console MySQL qui s'ouvre, taper :
   ```sql
   CREATE DATABASE mabel_stock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

#### B. Configurer le fichier `.env` du backend

1. **Aller dans** : `C:\laragon\www\MabelProject\backend\`
2. **Copier** le fichier `.env.example` et le renommer en `.env`
3. **Ouvrir** `.env` avec Notepad++ ou Bloc-notes
4. **Modifier** ces lignes :

```env
APP_NAME="Gestion Stock Mabel"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mabel_stock
DB_USERNAME=root
DB_PASSWORD=
```

> ⚠️ **Important** : `DB_PASSWORD` doit être vide (pas de mot de passe par défaut sur Laragon)

---

### **ÉTAPE 4 : Installer le Backend (Laravel)**

1. **Ouvrir le Terminal Laragon** :
   - Laragon → Menu → Terminal

2. **Naviguer vers le backend** :
   ```powershell
   cd C:\laragon\www\MabelProject\backend
   ```

3. **Installer les dépendances** :
   ```powershell
   composer install
   ```
   ⏱️ Durée : 2-3 minutes

4. **Générer la clé de l'application** :
   ```powershell
   php artisan key:generate
   ```

5. **Créer les tables de la base de données** :
   ```powershell
   php artisan migrate
   ```

6. **Créer le premier utilisateur admin** :
   ```powershell
   php artisan db:seed --class=UserSeeder
   ```

7. **Lancer le serveur backend** :
   ```powershell
   php artisan serve
   ```
   ✅ Le serveur démarre sur : `http://localhost:8000`

> 🔵 **Laisser cette fenêtre ouverte** - Ne pas fermer le terminal

---

### **ÉTAPE 5 : Installer le Frontend (React)**

1. **Ouvrir un NOUVEAU terminal Laragon** (Menu → Terminal)

2. **Naviguer vers le frontend** :
   ```powershell
   cd C:\laragon\www\MabelProject\FrontendReact
   ```

3. **Installer les dépendances** :
   ```powershell
   npm install
   ```
   ⏱️ Durée : 3-5 minutes

4. **Configurer l'URL du backend** :
   - Ouvrir : `FrontendReact\src\config\api.config.ts`
   - Vérifier que l'URL est : `http://localhost:8000`

5. **Lancer le serveur frontend** :
   ```powershell
   npm run dev
   ```
   ✅ L'interface démarre sur : `http://localhost:5173`

> 🔵 **Laisser cette fenêtre ouverte aussi** - Ne pas fermer

---

## 🚀 Utiliser l'Application

### **Accéder à l'application** :
1. Ouvrir un navigateur (Chrome, Edge, Firefox)
2. Aller sur : **http://localhost:5173**

### **Se connecter** :
- **Email** : `admin@mabel.sn`
- **Mot de passe** : `password123`

> ⚠️ **Changer le mot de passe** immédiatement après la première connexion !

---

## 🔄 Utilisation Quotidienne

### **Pour démarrer l'application chaque jour** :

1. **Lancer Laragon** → Cliquer sur "Démarrer tout"
2. **Ouvrir 2 terminaux** (Laragon → Terminal)

**Terminal 1 (Backend)** :
```powershell
cd C:\laragon\www\MabelProject\backend
php artisan serve
```

**Terminal 2 (Frontend)** :
```powershell
cd C:\laragon\www\MabelProject\FrontendReact
npm run dev
```

3. **Ouvrir le navigateur** : http://localhost:5173

---

## 🛠️ Raccourcis Rapides (Optionnel)

### **Créer un fichier de démarrage automatique**

Créer un fichier `demarrer-mabel.bat` avec ce contenu :

```batch
@echo off
echo ====================================
echo   Démarrage Gestion Stock Mabel
echo ====================================
echo.

REM Démarrer Laragon
start "" "C:\laragon\laragon.exe"
timeout /t 5

REM Démarrer le backend
start "Backend Laravel" cmd /k "cd C:\laragon\www\MabelProject\backend && php artisan serve"

REM Démarrer le frontend
timeout /t 3
start "Frontend React" cmd /k "cd C:\laragon\www\MabelProject\FrontendReact && npm run dev"

REM Ouvrir le navigateur
timeout /t 5
start http://localhost:5173

echo.
echo Application démarrée avec succès !
echo.
pause
```

**Double-cliquer sur ce fichier** pour tout lancer automatiquement ! 🎉

---

## 📊 Sauvegarde des Données

### **Sauvegarder la base de données** :

1. **Ouvrir Laragon** → MySQL → Ouvrir HeidiSQL
2. **Clic droit** sur `mabel_stock` → **Exporter la base**
3. Choisir un dossier (ex: `Documents\Sauvegardes\`)
4. Sauvegarder avec la date (ex: `mabel_stock_2025-11-28.sql`)

> 💡 **Conseil** : Faire une sauvegarde chaque semaine !

---

## ❓ Problèmes Fréquents

### **Erreur : "Port 8000 déjà utilisé"**
```powershell
# Utiliser un autre port
php artisan serve --port=8001
```
Puis mettre à jour `api.config.ts` avec le nouveau port.

### **Erreur : "SQLSTATE[HY000] [1045] Access denied"**
- Vérifier que MySQL est démarré dans Laragon
- Vérifier que `DB_PASSWORD` est vide dans `.env`

### **Erreur : "npm: command not found"**
- Réinstaller Laragon Full qui inclut Node.js
- Ou installer Node.js séparément : https://nodejs.org

### **Page blanche ou erreur 404**
- Vérifier que les 2 serveurs sont lancés (backend + frontend)
- Vérifier les URLs : `localhost:8000` et `localhost:5173`

---

## 📞 Support

En cas de problème, vérifier :
1. ✅ Laragon est démarré (icônes vertes)
2. ✅ Les 2 terminaux sont ouverts (backend + frontend)
3. ✅ Le fichier `.env` est correctement configuré
4. ✅ La base de données `mabel_stock` existe

---

## 🎓 Formation Rapide Utilisateur

### **Créer un produit** :
1. Menu **Produits** → **Nouveau Produit**
2. Remplir le formulaire
3. Enregistrer

### **Enregistrer une vente** :
1. Menu **Ventes** → Onglet **Nouvelle Vente**
2. Sélectionner le client
3. Ajouter les produits
4. Valider

### **Voir les rapports** :
1. Menu **Rapports**
2. Choisir la période
3. Exporter en PDF ou Excel

---

**✅ Installation terminée ! L'application est prête à être utilisée.**
