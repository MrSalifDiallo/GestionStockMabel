# 🏪 GESTION STOCK MABEL - DÉMARRAGE

## 👋 Bienvenue !

Vous avez entre les mains l'application de gestion de stock Mabel.

---

## 🚀 PAR OÙ COMMENCER ?

### 1️⃣ **PREMIÈRE INSTALLATION** (À faire une seule fois)

Suivez ces étapes **DANS L'ORDRE** :

```
1. Lire ce fichier (vous y êtes !)
2. Double-cliquer sur : verifier-systeme.bat
3. Si OK, double-cliquer sur : installer.bat
4. Attendre la fin de l'installation (5-7 minutes)
5. Double-cliquer sur : demarrer-mabel.bat
```

### 2️⃣ **UTILISATION QUOTIDIENNE** (Chaque jour)

```
1. Lancer Laragon (si pas déjà démarré)
2. Double-cliquer sur : demarrer-mabel.bat
3. Se connecter avec : admin@mabel.sn / password123
```

---

## 📂 FICHIERS IMPORTANTS

### 🔵 Fichiers à utiliser :

| Fichier | Description | Quand l'utiliser ? |
|---------|-------------|-------------------|
| `verifier-systeme.bat` | Vérifier que tout est OK | Avant la première installation |
| `installer.bat` | Installation automatique | UNE SEULE FOIS au début |
| `demarrer-mabel.bat` | Démarrer l'application | TOUS LES JOURS |
| `arreter.bat` | Arrêter l'application | Quand vous avez fini |
| `sauvegarder.bat` | Sauvegarder les données | UNE FOIS PAR SEMAINE |

### 📖 Fichiers de documentation :

| Fichier | Contenu |
|---------|---------|
| `LISEZ-MOI.md` | Instructions rapides |
| `INSTALLATION.md` | Guide détaillé complet |
| `README-PACKAGE.md` | Documentation complète |
| `AIDE-RAPIDE.txt` | Aide-mémoire |

---

## ⚙️ PRÉREQUIS

Avant de commencer, vous devez avoir :

✅ **Laragon Full** installé
   - Télécharger : https://laragon.org/download/
   - Choisir la version **FULL** (avec PHP, MySQL, Node.js)

✅ **Windows 10 ou 11**

✅ **Au moins 2 Go d'espace disque**

> 💡 Si vous n'avez pas Laragon, installez-le d'abord !

---

## 📋 CHECKLIST D'INSTALLATION

Cochez au fur et à mesure :

- [ ] Laragon Full installé
- [ ] Laragon démarré (icônes vertes)
- [ ] Dossier `MabelProject` copié dans `C:\laragon\www\`
- [ ] Base de données `mabel_stock` créée
- [ ] Script `verifier-systeme.bat` exécuté → Tout OK
- [ ] Script `installer.bat` exécuté → Installation réussie
- [ ] Script `demarrer-mabel.bat` exécuté → Application lancée
- [ ] Connexion réussie avec `admin@mabel.sn`
- [ ] Mot de passe changé
- [ ] Première sauvegarde effectuée

---

## 🎯 CONNEXION PAR DÉFAUT

Après l'installation, utilisez ces identifiants :

```
Email : admin@mabel.sn
Mot de passe : password123
```

⚠️ **IMPORTANT** : Changez ce mot de passe dès la première connexion !

---

## 🆘 EN CAS DE PROBLÈME

### Problème 1 : "Laragon n'est pas installé"
→ Télécharger et installer Laragon Full depuis https://laragon.org/download/

### Problème 2 : "Erreur lors de l'installation"
→ Lire le fichier **INSTALLATION.md** (guide détaillé)

### Problème 3 : "Page blanche"
→ Attendre 30 secondes, actualiser la page (F5)

### Problème 4 : "Impossible de se connecter"
→ Vérifier : `admin@mabel.sn` / `password123`

---

## 💾 SAUVEGARDE (TRÈS IMPORTANT !)

**Une fois par semaine :**

1. Double-cliquer sur : `sauvegarder.bat`
2. Un fichier est créé dans le dossier `sauvegardes/`
3. Copier ce fichier sur une **clé USB** ou **Cloud**

> ⚠️ Sans sauvegarde, vous risquez de perdre toutes vos données !

---

## 📱 UTILISATION DE L'APPLICATION

### Menu principal :

- **Dashboard** : Vue d'ensemble, statistiques
- **Ventes** : Enregistrer les ventes
- **Produits** : Gérer le catalogue
- **Clients** : Gérer les clients
- **Dépenses** : Enregistrer les dépenses
- **Rapports** : Statistiques, exports PDF/Excel
- **Paramètres** : Configuration, remises

### Actions rapides :

```
Vente : Ventes → Nouvelle Vente → Sélectionner client → Ajouter produits → Enregistrer
Produit : Produits → Nouveau → Remplir → Enregistrer
Rapport : Rapports → Choisir période → Exporter
```

---

## 🔗 LIENS UTILES

Une fois l'application démarrée :

- **Interface utilisateur** : http://localhost:5173
- **API Backend** : http://localhost:8000

---

## 📞 SUPPORT

Si vous êtes bloqué :

1. Consultez **AIDE-RAPIDE.txt** pour les solutions rapides
2. Lisez **INSTALLATION.md** pour les détails
3. Vérifiez **README-PACKAGE.md** pour la documentation complète

---

## 🎓 FORMATION

### Vidéos recommandées (à créer) :

1. Installation de Laragon (5 min)
2. Premier démarrage de l'application (3 min)
3. Enregistrer une vente (5 min)
4. Gérer les produits (5 min)
5. Consulter les rapports (3 min)

---

## ✅ TOUT EST PRÊT ?

Si vous avez :
- ✅ Laragon installé
- ✅ Ce dossier dans `C:\laragon\www\`
- ✅ La base de données créée

Alors vous pouvez lancer : **installer.bat** ! 🚀

---

## 🎉 BONNE UTILISATION !

L'application est conçue pour être simple et intuitive.

**En cas de doute, consultez AIDE-RAPIDE.txt**

---

_Gestion Stock Mabel - Version 1.0 - Novembre 2025_

**Contact Développeur** : MrSalifDiallo  
**Repository** : GestionStockMabel
