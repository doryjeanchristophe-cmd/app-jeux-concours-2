# Guide de déploiement — GagnezFacile sur Render

## Étape 1 — Mettre le code sur GitHub

### 1.1 Installer Git sur votre ordinateur
- Windows : https://git-scm.com/download/win → Télécharger et installer
- Mac : ouvrez le Terminal et tapez `git --version` (s'installe automatiquement)

### 1.2 Créer un nouveau dépôt GitHub
1. Allez sur github.com et connectez-vous
2. Cliquez sur le "+" en haut à droite → "New repository"
3. Nom du dépôt : `gagnezfacile`
4. Laissez tout par défaut → cliquez "Create repository"

### 1.3 Envoyer le code sur GitHub
Ouvrez un terminal dans le dossier du projet et tapez ces commandes une par une :

```bash
git init
git add .
git commit -m "Premier commit - GagnezFacile"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/gagnezfacile.git
git push -u origin main
```

⚠️ Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub

---

## Étape 2 — Déployer sur Render

### 2.1 Créer le service Backend (API)
1. Allez sur render.com → Dashboard → "New +" → "Web Service"
2. Connectez votre dépôt GitHub `gagnezfacile`
3. Configurez :
   - **Name** : `gagnezfacile-api`
   - **Root Directory** : `app-concours/backend`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
   - **Plan** : Free
4. Cliquez "Create Web Service"
5. Attendez que le déploiement soit "Live" (2-3 minutes)
6. **Copiez l'URL** du service (ex: https://gagnezfacile-api.onrender.com)

### 2.2 Créer le service Scraper (Cron Job)
1. Dashboard → "New +" → "Cron Job"
2. Connectez le même dépôt GitHub
3. Configurez :
   - **Name** : `gagnezfacile-scraper`
   - **Root Directory** : `scraper-concours`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Schedule** : `0 6 * * *` (tous les jours à 6h)
   - **Command** : `node index.js`
   - **Plan** : Free
4. Cliquez "Create Cron Job"

### 2.3 Mettre à jour l'URL de l'API dans le Frontend
Ouvrez le fichier `app-concours/frontend/src/App.jsx` et remplacez :

```javascript
const API = "http://localhost:3001/api";
```

par :

```javascript
const API = "https://gagnezfacile-api.onrender.com/api";
```

(utilisez l'URL copiée à l'étape 2.1)

Puis envoyez la modification sur GitHub :

```bash
git add .
git commit -m "Mise à jour URL API production"
git push
```

### 2.4 Créer le service Frontend (Site statique)
1. Dashboard → "New +" → "Static Site"
2. Connectez le même dépôt GitHub
3. Configurez :
   - **Name** : `gagnezfacile`
   - **Root Directory** : `app-concours/frontend`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
4. Cliquez "Create Static Site"
5. Attendez 2-3 minutes → votre app est en ligne !

---

## Résultat final

Vous aurez 3 services sur Render :
- 🌐 **Frontend** : https://gagnezfacile.onrender.com
- ⚙️ **Backend API** : https://gagnezfacile-api.onrender.com
- ⏰ **Scraper** : tourne automatiquement tous les jours à 6h

---

## ⚠️ Important — Plan gratuit Render

Sur le plan gratuit, les services s'endorment après 15 minutes d'inactivité.
La première visite peut prendre 30-60 secondes le temps que le service se réveille.
Pour éviter ça, vous pouvez passer au plan Starter (7$/mois).
