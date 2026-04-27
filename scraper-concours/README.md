# Scraper Jeux Concours France

Scraper automatique qui collecte les jeux concours depuis 4 sites français spécialisés et les stocke dans une base de données SQLite.

## Sources scrapées

| Site | Concours/jour | Images | Réponses | Valeur € |
|------|--------------|--------|----------|----------|
| jeu-concours.biz | ~140 | ✅ | ✅ | ❌ |
| leparadisdesjeuxconcours.fr | ~50 | ✅ | ✅ | ❌ |
| ledemondujeu.com | ~100 | ❌ | ✅ | ✅ |
| concours-du-net.com | ~73 | ✅ | ✅ | ✅ |

## Prérequis

- Node.js v18 ou supérieur
- npm

## Installation

```bash
# 1. Cloner ou copier ce projet
cd scraper-concours

# 2. Installer les dépendances
npm install

# 3. Lancer le scraping une fois
npm run scrape

# 4. Lancer le CRON (scraping automatique 2x/jour)
npm run cron
```

## Structure des fichiers

```
scraper-concours/
├── index.js              ← Orchestrateur principal
├── cron.js               ← Planificateur automatique
├── db.js                 ← Base de données SQLite
├── logger.js             ← Système de logs
├── utils.js              ← Fonctions utilitaires
├── scrapers/
│   ├── jeuconcoursbiz.js       ← Scraper jeu-concours.biz
│   ├── leparadis.js            ← Scraper leparadisdesjeuxconcours.fr
│   ├── ledemondujeu.js         ← Scraper ledemondujeu.com
│   └── concoursdunet.js        ← Scraper concours-du-net.com
├── concours.db           ← Base SQLite (générée automatiquement)
├── concours.json         ← Export JSON pour l'interface web
└── logs/
    └── scraper.log       ← Fichier de logs
```

## Données collectées

Pour chaque concours :

| Champ | Description |
|-------|-------------|
| `titre` | Nom du concours / organisateur |
| `lot` | Description des lots à gagner |
| `valeur_lot` | Valeur en euros (si disponible) |
| `date_cloture` | Date de fin du concours |
| `type_mecanique` | tirage / instant_gagnant / inscription_simple / score / creatif |
| `frequence` | quotidien / hebdomadaire / mensuel |
| `reponses` | Réponses aux questions du concours |
| `lien_direct` | URL pour participer directement |
| `image_url` | Image du concours |
| `source` | Site d'origine |
| `categorie` | voyage / high-tech / gaming / bon_achat / mode_beaute... |
| `actif` | 1 = en cours / 0 = expiré |

## Requêtes SQL utiles

```sql
-- Tous les concours actifs
SELECT * FROM concours WHERE actif = 1 ORDER BY date_cloture ASC;

-- Concours qui expirent aujourd'hui
SELECT * FROM concours WHERE actif = 1 AND date_cloture = date('now');

-- Instants gagnants uniquement
SELECT * FROM concours WHERE type_mecanique = 'instant_gagnant' AND actif = 1;

-- Concours par catégorie
SELECT * FROM concours WHERE categorie = 'voyage' AND actif = 1;

-- Stats par source
SELECT source, COUNT(*) as nb FROM concours WHERE actif = 1 GROUP BY source;
```

## Utiliser les données dans votre app web

Le scraping génère automatiquement un fichier `concours.json` que vous pouvez consommer directement dans votre frontend React :

```javascript
// Dans votre composant React
useEffect(() => {
  fetch('/concours.json')
    .then(r => r.json())
    .then(data => setConcours(data));
}, []);
```

## Notes importantes

- Le scraper attend 2 secondes entre chaque requête pour ne pas surcharger les serveurs
- Les doublons sont automatiquement éliminés grâce à l'URL unique de chaque concours
- Les concours expirés sont marqués inactifs automatiquement
- Les logs sont disponibles dans `logs/scraper.log`

## Prochaines étapes

1. Connecter ce scraper à votre backend Express
2. Exposer une API REST : `GET /api/concours?type=instant&categorie=voyage`
3. Brancher votre frontend React sur cette API
