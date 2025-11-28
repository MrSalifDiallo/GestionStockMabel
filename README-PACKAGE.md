# 📦 PACKAGE D'INSTALLATION - GESTION STOCK MABEL

## 📋 Contenu du Package

Ce package contient tout le nécessaire pour installer l'application de gestion de stock sur un PC Windows.

### 📁 Structure des Fichiers

```
MabelProject/
│
├── 📖 LISEZ-MOI.md              ← COMMENCER ICI !
├── 📖 INSTALLATION.md           ← Guide détaillé complet
├── 🚀 installer.bat             ← Installation automatique
├── 🎯 demarrer-mabel.bat        ← Démarrage quotidien
├── 💾 sauvegarder.bat           ← Sauvegarde base de données
│
├── backend/                     ← Code serveur (Laravel/PHP)
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── .env.example
│
└── FrontendReact/               ← Interface utilisateur (React)
    ├── src/
    ├── public/
    └── package.json
```

---

## ⚡ Installation Express (5 minutes)

### Étape 1 : Installer Laragon
- 📥 Télécharger : https://laragon.org/download/
- Choisir **Laragon Full**
- Installer et lancer

### Étape 2 : Copier les Fichiers
- Copier le dossier `MabelProject` dans : `C:\laragon\www\`

### Étape 3 : Créer la Base de Données
- Laragon → Clic droit → MySQL → Open
- Taper :
```sql
CREATE DATABASE mabel_stock;
EXIT;
```

### Étape 4 : Installer
- Double-cliquer sur : **installer.bat**
- Attendre la fin (5-7 minutes)

### Étape 5 : Lancer l'Application
- Double-cliquer sur : **demarrer-mabel.bat**
- Navigateur s'ouvre automatiquement

### Étape 6 : Se Connecter
- Email : `admin@mabel.sn`
- Mot de passe : `password123`
- ⚠️ Changer le mot de passe immédiatement !

---

## 🎯 Utilisation Quotidienne

**Chaque jour pour utiliser l'application :**

1. ✅ Lancer Laragon
2. ✅ Double-cliquer sur `demarrer-mabel.bat`
3. ✅ Se connecter

C'est tout ! 🎉

---

## 💾 Sauvegarde (IMPORTANT !)

**Une fois par semaine :**

1. Double-cliquer sur : `sauvegarder.bat`
2. Copier le fichier créé sur une clé USB

Les sauvegardes sont dans : `MabelProject\sauvegardes\`

---

## 👥 Utilisateurs Créés par Défaut

L'installation crée automatiquement 3 utilisateurs :

### 1. Administrateur
- Email : `admin@mabel.sn`
- Mot de passe : `password123`
- Droits : Tous les accès

### 2. Vendeur 1 (Fatoumata)
- Email : `fatou@mabel.sn`
- Mot de passe : `password123`
- Droits : Ventes, Clients, Produits

### 3. Vendeur 2 (Aminata)
- Email : `aminata@mabel.sn`
- Mot de passe : `password123`
- Droits : Ventes, Clients, Produits

> ⚠️ **Changer tous ces mots de passe après la première connexion !**

---

## 📊 Fonctionnalités Principales

### 🏪 Gestion des Ventes
- Enregistrement rapide des ventes
- Remise automatique par quantité
- Gestion des clients ponctuels
- Suivi des paiements partiels
- Impression de facture

### 📦 Gestion des Produits
- Catalogue complet
- Catégories personnalisables
- Suivi du stock en temps réel
- Alertes de stock faible
- Import/Export Excel

### 👥 Gestion des Clients
- Fiche client complète
- Historique d'achats
- Suivi des créances
- Statistiques par client

### 💰 Gestion des Dépenses
- Enregistrement des dépenses
- Catégorisation
- Rapports mensuels

### 📈 Rapports et Statistiques
- Tableau de bord en temps réel
- Graphiques de ventes
- Exports PDF et Excel
- Rapports personnalisables

### ⚙️ Paramètres
- Configuration des remises automatiques
- Gestion des utilisateurs
- Personnalisation de l'interface
- Thème clair/sombre

---

## 🔧 Configuration des Remises Automatiques

Par défaut, l'application applique :

- **6 à 9 articles** → 5% de remise
- **10+ articles** → 10% de remise

Pour modifier :
1. Menu **Paramètres** → Onglet **Remises**
2. Ajuster les paliers
3. Enregistrer

---

## 🆘 Problèmes Fréquents et Solutions

### ❌ "Port 8000 déjà utilisé"
**Solution** : Un autre programme utilise le port. Redémarrer le PC.

### ❌ "Erreur de connexion à la base de données"
**Solution** :
- Vérifier que Laragon est démarré (icônes vertes)
- Vérifier que la base `mabel_stock` existe
- Vérifier le fichier `backend\.env`

### ❌ Page blanche
**Solution** :
- Vérifier que les 2 fenêtres (Backend + Frontend) sont ouvertes
- Attendre 30 secondes après le démarrage

### ❌ "npm: command not found"
**Solution** : Réinstaller Laragon Full qui inclut Node.js

### ❌ Impossible de se connecter
**Solution** :
- Vérifier que le UserSeeder a été exécuté
- Utiliser : `admin@mabel.sn` / `password123`

---

## 📞 Support Technique

### Vérifications de Base

Avant de paniquer, vérifier :

1. ✅ Laragon est démarré (icônes vertes)
2. ✅ Les 2 terminaux (Backend + Frontend) sont ouverts
3. ✅ Pas de message d'erreur rouge dans les terminaux
4. ✅ URL correcte : `http://localhost:5173`

### Réinstallation Complète

Si tout est cassé :

1. Supprimer la base de données :
   ```sql
   DROP DATABASE mabel_stock;
   CREATE DATABASE mabel_stock;
   ```

2. Re-lancer : `installer.bat`

---

## 🔐 Sécurité

### Recommandations :

1. **Changer les mots de passe** immédiatement après installation
2. **Sauvegarder régulièrement** la base de données
3. **Antivirus** : Ajouter `C:\laragon\www` aux exceptions
4. **Firewall** : Autoriser Laragon si demandé

### Sauvegarde Complète :

Copier ces éléments sur clé USB chaque semaine :
- `MabelProject\sauvegardes\` (bases de données)
- `MabelProject\backend\.env` (configuration)

---

## 🎓 Formation Rapide

### Créer un Produit
1. Menu **Produits** → **Nouveau Produit**
2. Nom, Prix, Stock, Catégorie
3. **Enregistrer**

### Enregistrer une Vente
1. Menu **Ventes** → **Nouvelle Vente**
2. Sélectionner client
3. Ajouter produits (la remise s'applique automatiquement)
4. Montant payé
5. **Enregistrer & Imprimer**

### Voir les Statistiques
1. Menu **Rapports**
2. Choisir la période
3. **Exporter PDF** ou **Excel**

### Ajouter un Utilisateur
1. Menu **Paramètres** → Onglet **Utilisateurs** (admin seulement)
2. Créer un nouveau vendeur
3. Lui donner ses accès

---

## 📈 Avantages de cette Solution

### ✅ Économique
- Pas de frais d'hébergement mensuel
- Pas d'abonnement cloud
- Une seule installation

### ✅ Rapide
- Fonctionne hors-ligne
- Pas de latence internet
- Données en local

### ✅ Sécurisé
- Données sur le PC, pas dans le cloud
- Pas de risque de piratage externe
- Contrôle total

### ⚠️ Limitations
- Accessible uniquement sur ce PC
- Nécessite des sauvegardes manuelles
- PC doit être allumé pour utiliser

---

## 🚀 Évolution Future

### Si le Commerce Grandit

Plusieurs options d'évolution :

1. **Réseau Local** : Connecter plusieurs PC du magasin
2. **Cloud** : Migrer vers un hébergement en ligne
3. **Application Mobile** : Version smartphone
4. **Multi-boutiques** : Gérer plusieurs magasins

Toutes ces évolutions sont possibles sans perdre les données.

---

## 📖 Documentation Complète

- **LISEZ-MOI.md** : Ce fichier
- **INSTALLATION.md** : Guide détaillé pas à pas
- **backend/README.md** : Documentation technique API
- **FrontendReact/README.md** : Documentation technique Interface

---

## ✅ Checklist Post-Installation

Après installation, vérifier :

- [ ] Connexion réussie avec `admin@mabel.sn`
- [ ] Mot de passe admin changé
- [ ] Création d'un produit test
- [ ] Enregistrement d'une vente test
- [ ] Vérification des rapports
- [ ] Première sauvegarde effectuée
- [ ] Raccourci bureau créé pour `demarrer-mabel.bat`

---

## 🎉 Félicitations !

L'application est maintenant installée et prête à l'emploi.

**Pour démarrer chaque jour :**
1. Lancer Laragon
2. Double-cliquer sur `demarrer-mabel.bat`
3. Commencer à travailler !

**Bon courage et bonne gestion ! 💼**

---

_Gestion Stock Mabel - Version 1.0 - Novembre 2025_
