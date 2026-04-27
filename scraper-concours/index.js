// index.js — Orchestrateur principal du scraping
require('./utils'); // charge les fonctions globales
const { initDB } = require('./db');
const logger = require('./logger');
const { dedupliquer, estActif, formatDate } = require('./utils');
const fs = require('fs');

// Créer le dossier logs si nécessaire
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

// Import des scrapers
const scrapers = [
  { nom: 'jeu-concours.biz', module: require('./scrapers/jeuconcoursbiz') },
  { nom: 'leparadisdesjeuxconcours.fr', module: require('./scrapers/leparadis') },
  { nom: 'ledemondujeu.com', module: require('./scrapers/ledemondujeu') },
  { nom: 'concours-du-net.com', module: require('./scrapers/concoursdunet') },
];

// Sauvegarder les concours en base de données
function sauvegarderEnBase(db, concours) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO concours (
      titre, organisateur, lot, valeur_lot, date_cloture, date_publication,
      type_mecanique, frequence, reponses, lien_direct, image_url, source, categorie, actif
    ) VALUES (
      @titre, @organisateur, @lot, @valeur_lot, @date_cloture, @date_publication,
      @type_mecanique, @frequence, @reponses, @lien_direct, @image_url, @source, @categorie, @actif
    )
  `);

  const insertMany = db.transaction((items) => {
    let inseres = 0;
    for (const item of items) {
      const result = insert.run({
        ...item,
        date_cloture: formatDate(item.date_cloture) || item.date_cloture,
        actif: estActif(item.date_cloture) ? 1 : 0,
      });
      if (result.changes > 0) inseres++;
    }
    return inseres;
  });

  return insertMany(concours);
}

// Marquer les concours expirés comme inactifs
function nettoyerConcourExpires(db) {
  const result = db.prepare(`
    UPDATE concours 
    SET actif = 0, updated_at = datetime('now')
    WHERE actif = 1 
    AND date_cloture IS NOT NULL 
    AND date_cloture < date('now')
  `).run();
  logger.info(`${result.changes} concours marqués comme expirés`);
}

// Fonction principale
async function main() {
  logger.info('===== DÉBUT DU SCRAPING =====');
  const debut = Date.now();

  const db = initDB();
  let totalInseres = 0;
  let totalRecuperes = 0;

  for (const scraper of scrapers) {
    try {
      logger.info(`--- Lancement du scraper: ${scraper.nom} ---`);
      const concours = await scraper.module.scrapeAll();
      totalRecuperes += concours.length;

      if (concours.length > 0) {
        const inseres = sauvegarderEnBase(db, concours);
        totalInseres += inseres;
        logger.info(`[${scraper.nom}] ${inseres} nouveaux concours insérés (${concours.length} récupérés)`);
      }
    } catch (err) {
      logger.error(`[${scraper.nom}] Erreur critique: ${err.message}`);
    }
  }

  // Nettoyer les concours expirés
  nettoyerConcourExpires(db);

  // Stats finales
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) as actifs,
      COUNT(DISTINCT source) as sources
    FROM concours
  `).get();

  const duree = ((Date.now() - debut) / 1000).toFixed(1);
  logger.info(`===== SCRAPING TERMINÉ en ${duree}s =====`);
  logger.info(`Récupérés: ${totalRecuperes} | Nouveaux: ${totalInseres}`);
  logger.info(`Base: ${stats.total} total | ${stats.actifs} actifs | ${stats.sources} sources`);

  // Exporter un JSON pour l'interface web
  const tousLesconcours = db.prepare(`
    SELECT * FROM concours 
    WHERE actif = 1 
    ORDER BY created_at DESC 
    LIMIT 500
  `).all();

  fs.writeFileSync('./concours.json', JSON.stringify(tousLesconcours, null, 2));
  logger.info(`Export JSON: ${tousLesconcours.length} concours actifs → concours.json`);

  db.close();
}

main().catch(err => {
  logger.error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});
