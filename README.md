# GagnezFacile — Agrégateur de Jeux Concours France

Application web complète qui scrape automatiquement 4 sites de jeux concours français et les affiche dans une interface moderne.

---

## Architecture

```
projet/
├── scraper-concours/     ← Robot qui collecte les concours (Node.js)
├── app-concours/
│   ├── backend/          ← API REST (Express)
│   └── frontend/         ← Interface React
```

---

## Installation complète

### Étape 1 — Scraper (collecte des données)

```bash
cd scraper-concours
npm install
npm run scrape        # Lance le scraping une fois
npm run cron          # Lance le scraping automatique 2x/jour
```

→ Génère `concours.db` et `concours.json`

---

### Étape 2 — Backend API

```bash
cd app-concours/backend
npm install
npm start             # Lance l'API sur http://localhost:3001
```

Routes disponibles :
- `GET /api/concours` — liste avec filtres
- `GET /api/concours?type=instant_gagnant`
- `GET /api/concours?categorie=voyage`
- `GET /api/concours?urgent=true`
- `GET /api/concours?search=nespresso`
- `GET /api/concours/:id`
- `GET /api/stats`
- `GET /api/nouveaux`
- `GET /api/expirent-aujourd-hui`

---

### Étape 3 — Frontend React

```bash
cd app-concours/frontend
npm install
npm run dev           # Lance l'interface sur http://localhost:3000
```

---

## Lancer tout en même temps

Ouvrez **3 terminaux** :

```bash
# Terminal 1 — Scraper automatique
cd scraper-concours && npm run cron

# Terminal 2 — API
cd app-concours/backend && npm start

# Terminal 3 — Frontend
cd app-concours/frontend && npm run dev
```

Puis ouvrez http://localhost:3000 dans votre navigateur.

---

## Fonctionnalités

- ✅ Scraping automatique de 4 sites (300+ concours/jour)
- ✅ Filtres par type, catégorie, urgence
- ✅ Recherche texte libre
- ✅ Détection automatique des catégories
- ✅ Badge "Expire bientôt" (< 3 jours)
- ✅ Réponses aux questions affichées
- ✅ Interface sombre moderne
- ✅ Modal de détail avec lien de participation
- ✅ Pagination (bouton "Afficher plus")
- ✅ Nettoyage automatique des concours expirés

---

## Sources scrapées

| Site | ~Concours/jour |
|------|---------------|
| jeu-concours.biz | ~140 |
| leparadisdesjeuxconcours.fr | ~50 |
| ledemondujeu.com | ~100 |
| concours-du-net.com | ~73 |

---

## Prochaines étapes possibles

- Alertes email pour les nouvelles catégories
- Système de favoris
- Compte utilisateur
- Déploiement en ligne (Vercel + Railway)
