// cron.js — Planification automatique du scraping (1x par jour)
require('./utils');
const cron = require('node-cron');
const { execSync } = require('child_process');
const logger = require('./logger');
const fs = require('fs');

if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

logger.info('Planificateur CRON démarré');
logger.info('Scraping planifié tous les jours à 06h00');

// Lancer immédiatement au démarrage
logger.info('Premier scraping au démarrage...');
try {
  execSync('node index.js', { stdio: 'inherit' });
} catch (err) {
  logger.error(`Erreur premier scraping: ${err.message}`);
}

// Planifier le scraping quotidien à 06h00
cron.schedule('0 6 * * *', () => {
  logger.info('Scraping quotidien automatique lancé (06h00)');
  try {
    execSync('node index.js', { stdio: 'inherit' });
    logger.info('Scraping quotidien terminé avec succès');
  } catch (err) {
    logger.error(`Erreur scraping quotidien: ${err.message}`);
  }
}, {
  timezone: 'Europe/Paris'
});

// Scraping supplémentaire à 18h00 pour les nouveaux concours du soir
cron.schedule('0 18 * * *', () => {
  logger.info('Scraping du soir lancé (18h00)');
  try {
    execSync('node index.js', { stdio: 'inherit' });
    logger.info('Scraping du soir terminé');
  } catch (err) {
    logger.error(`Erreur scraping du soir: ${err.message}`);
  }
}, {
  timezone: 'Europe/Paris'
});

logger.info('En attente... (Ctrl+C pour arrêter)');
