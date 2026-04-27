// scrapers/jeuconcoursbiz.js — Scraper pour jeu-concours.biz
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

const BASE_URL = 'https://www.jeu-concours.biz';
const SOURCE = 'jeu-concours.biz';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// Attendre entre les requêtes pour ne pas surcharger le serveur
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
  try {
    const response = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return response.data;
  } catch (err) {
    logger.error(`[${SOURCE}] Erreur fetch ${url}: ${err.message}`);
    return null;
  }
}

// Extraire les concours de la page principale ou des pages "nouveaux concours"
async function scrapeListPage(url) {
  const html = await fetchPage(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const concours = [];

  // Chaque fiche concours sur jeu-concours.biz
  $('div.jeu').each((i, el) => {
    try {
      const titre = $(el).find('h2, h3, .titre-jeu').first().text().trim();
      const lot = $(el).find('.cadeaux, .lot, .dotation').first().text().trim();
      const lienEl = $(el).find('a[href*="concours"]').first();
      const lien = lienEl.attr('href') ? BASE_URL + lienEl.attr('href') : null;
      const image = $(el).find('img').first().attr('src') || null;
      const dateCloture = $(el).find('.date-cloture, .cloture').first().text().replace(/[^0-9/]/g, '').trim();
      const principe = $(el).find('.principe, .participation').first().text().trim();

      // Détection du type de mécanique
      let typeMecanique = 'tirage';
      const texte = $(el).text().toLowerCase();
      if (texte.includes('instant gagnant')) typeMecanique = 'instant_gagnant';
      else if (texte.includes('inscription')) typeMecanique = 'inscription_simple';
      else if (texte.includes('score')) typeMecanique = 'score';
      else if (texte.includes('créatif')) typeMecanique = 'creatif';

      // Détection fréquence
      let frequence = null;
      if (texte.includes('quotidien')) frequence = 'quotidien';
      else if (texte.includes('hebdomadaire')) frequence = 'hebdomadaire';
      else if (texte.includes('mensuel')) frequence = 'mensuel';

      // Réponses aux questions
      const reponses = $(el).find('.reponses, .réponses').first().text().trim() || null;

      // Image absolue
      const imageUrl = image && image.startsWith('http') ? image :
        image ? BASE_URL + image : null;

      if (titre && lien) {
        concours.push({
          titre,
          organisateur: titre,
          lot,
          valeur_lot: null,
          date_cloture: dateCloture || null,
          date_publication: new Date().toISOString().split('T')[0],
          type_mecanique: typeMecanique,
          frequence,
          reponses,
          lien_direct: lien,
          image_url: imageUrl,
          source: SOURCE,
          categorie: detectCategorie(lot),
        });
      }
    } catch (err) {
      logger.warn(`[${SOURCE}] Erreur parsing concours: ${err.message}`);
    }
  });

  return concours;
}

// Scraper toutes les pages de nouveaux concours
async function scrapeAll() {
  logger.info(`[${SOURCE}] Début du scraping...`);
  const allConcours = [];

  // Page principale des nouveaux concours
  const urls = [
    `${BASE_URL}/nouveaux-concours.html`,
    `${BASE_URL}/jeux-concours/`,
    `${BASE_URL}/instants-gagnants.php`,
    `${BASE_URL}/quotidien.php`,
  ];

  for (const url of urls) {
    logger.info(`[${SOURCE}] Scraping: ${url}`);
    const concours = await scrapeListPage(url);
    allConcours.push(...concours);
    await sleep(2000); // pause 2s entre chaque page
  }

  // Dédoublonnage par lien
  const seen = new Set();
  const unique = allConcours.filter(c => {
    if (seen.has(c.lien_direct)) return false;
    seen.add(c.lien_direct);
    return true;
  });

  logger.info(`[${SOURCE}] ${unique.length} concours récupérés`);
  return unique;
}

module.exports = { scrapeAll };
