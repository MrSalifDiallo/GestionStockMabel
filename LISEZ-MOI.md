# 🚀 Installation Rapide

## Pour la Cliente

### Option 1 : Installation Automatique (Recommandée) ✨

1. **Installer Laragon** (Une seule fois)
   - Télécharger : https://laragon.org/download/
   - Prendre **Laragon Full**
   - Installer et lancer Laragon
   - Cliquer sur "Démarrer tout"

2. **Copier ce dossier** `MabelProject` dans :
   ```
   C:\laragon\www\
   ```

3. **Créer la base de données**
   - Laragon → Clic droit → MySQL → Open
   - Taper :
   ```sql
   CREATE DATABASE mabel_stock;
   EXIT;
   ```

4. **Lancer l'installation automatique**
   - Double-cliquer sur : `installer.bat`
   - Suivre les instructions à l'écran

5. **Utilisation quotidienne**
   - Double-cliquer sur : `demarrer-mabel.bat`
   - Se connecter avec :
     - Email : `admin@mabel.sn`
     - Mot de passe : `password123`

---

### Option 2 : Installation Manuelle (Si problème)

Voir le fichier complet : **INSTALLATION.md**

---

## 📞 En cas de problème

1. Vérifier que Laragon est démarré (icônes vertes)
2. Vérifier que la base de données `mabel_stock` existe
3. Lire le fichier **INSTALLATION.md** pour les solutions

---

## 🎓 Formation Utilisateur

### Menu principal :
- **Dashboard** : Vue d'ensemble (chiffres, graphiques)
- **Ventes** : Enregistrer une nouvelle vente
- **Produits** : Gérer le catalogue
- **Clients** : Gérer les clients
- **Dépenses** : Enregistrer les dépenses
- **Rapports** : Statistiques et exports

### Enregistrer une vente :
1. Menu **Ventes** → Nouvelle Vente
2. Sélectionner le client (ou "Client Ponctuel")
3. Ajouter les produits
4. La remise s'applique automatiquement selon la quantité
5. Entrer le montant payé
6. Cliquer sur "Enregistrer & Imprimer"

### Ajouter un produit :
1. Menu **Produits** → Nouveau Produit
2. Remplir : Nom, Catégorie, Prix, Stock
3. Enregistrer

### Voir les statistiques :
1. Menu **Rapports**
2. Choisir la période
3. Exporter en PDF ou Excel si besoin

---

## 💾 Sauvegarde Importante

**Faire une sauvegarde chaque semaine !**

1. Laragon → MySQL → HeidiSQL
2. Clic droit sur `mabel_stock` → Exporter
3. Sauvegarder dans un dossier sûr (Clé USB, Cloud)

---

## 🔧 Fichiers Importants

- **INSTALLATION.md** - Guide complet détaillé
- **installer.bat** - Installation automatique
- **demarrer-mabel.bat** - Démarrage quotidien
- **backend/.env** - Configuration (NE PAS SUPPRIMER)

---

## ✅ Checklist d'Installation

- [ ] Laragon installé et démarré
- [ ] Dossier copié dans `C:\laragon\www\`
- [ ] Base de données `mabel_stock` créée
- [ ] Script `installer.bat` exécuté avec succès
- [ ] Connexion réussie sur http://localhost:5173
- [ ] Mot de passe admin changé

---

**Tout est prêt ! L'application fonctionne maintenant en local sur le PC.**

Pour toute question, consultez **INSTALLATION.md** 📖
