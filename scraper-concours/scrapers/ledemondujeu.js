// scrapers/ledemondujeu.js — Scraper pour ledemondujeu.com
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

const BASE_URL = 'https://www.ledemondujeu.com';
const SOURCE = 'ledemondujeu.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Referer': 'https://www.ledemondujeu.com/',
};

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

// Extraire la valeur en euros du texte du lot
function extractValeur(texte) {
  const match = texte.match(/\(?\s*(\d[\d\s]*)\s*[€$]\s*\)?/);
  return match ? match[1].replace(/\s/g, '') + '€' : null;
}

async function scrapePage(url) {
  const html = await fetchPage(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const concours = [];

  // ledemondujeu.com structure : chaque concours dans un bloc avec classe jeu ou article
  $('div.jeu, article, div[class*="concours"]').each((i, el) => {
    try {
      const titreEl = $(el).find('h2, h3, .organisateur, strong').first();
      const titre = titreEl.text().trim();
      if (!titre || titre.length < 2) return;

      const lienEl = $(el).find('a[href*="jeu-"]').first() ||
        $(el).find('a[href*="concours"]').first();
      const lienHref = lienEl.attr('href');
      if (!lienHref) return;

      const lien = lienHref.startsWith('http') ? lienHref : BASE_URL + lienHref;

      const lotEl = $(el).find('.cadeaux, .lot, .dotation, p').first();
      const lot = lotEl.text().trim();
      const valeurLot = extractValeur(lot);

      // Date de clôture — format "Clôture le DD/MM/YYYY"
      const texteBloc = $(el).text();
      const dateMatch = texteBloc.match(/[Cc]l[ôo]ture\s+le\s+(\d{2}\/\d{2}\/\d{4})/);
      const dateCloture = dateMatch ? dateMatch[1] : null;

      // Date de publication
      const pubMatch = texteBloc.match(/[Aa]jout[ée]\s+le\s+(\d{2}\/\d{2}\/\d{4})/);
      const datePub = pubMatch ? pubMatch[1] : new Date().toISOString().split('T')[0];

      // Type de mécanique
      let typeMecanique = 'tirage';
      const texteLower = texteBloc.toLowerCase();
      if (texteLower.includes('instant gagnant')) typeMecanique = 'instant_gagnant';
      else if (texteLower.includes('score')) typeMecanique = 'score';
      else if (texteLower.includes('créatif') || texteLower.includes('creatif')) typeMecanique = 'creatif';

      // Fréquence
      let frequence = null;
      if (texteLower.includes('quotidien')) frequence = 'quotidien';
      else if (texteLower.includes('hebdomadaire')) frequence = 'hebdomadaire';
      else if (texteLower.includes('mensuel')) frequence = 'mensuel';

      // Réponses
      const reponsesMatch = texteBloc.match(/[Rr][ée]ponses?\s*[:\s]+(.+?)(?=Conditions|Principe|$)/s);
      const reponses = reponsesMatch ? reponsesMatch[1].trim().substring(0, 500) : null;

      concours.push({
        titre,
        organisateur: titre,
        lot,
        valeur_lot: valeurLot,
        date_cloture: dateCloture,
        date_publication: datePub,
        type_mecanique: typeMecanique,
        frequence,
        reponses,
        lien_direct: lien,
        image_url: null,
        source: SOURCE,
        categorie: detectCategorie(lot),
      });
    } catch (err) {
      logger.warn(`[${SOURCE}] Erreur parsing: ${err.message}`);
    }
  });

  const seen = new Set();
  return concours.filter(c => {
    if (seen.has(c.lien_direct)) return false;
    seen.add(c.lien_direct);
    return true;
  });
}

async function scrapeAll() {
  logger.info(`[${SOURCE}] Début du scraping...`);
  const allConcours = [];

  // Scraper plusieurs pages de nouveaux concours
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '-');

  const urls = [
    `${BASE_URL}/nouveaux-jeux-concours.html`,
    `${BASE_URL}/concours-instants-gagnants-1.html`,
    `${BASE_URL}/concours-quotidiens-1.html`,
    `${BASE_URL}/concours-tirage-au-sort-1.html`,
    `${BASE_URL}/jeux-concours-cloture.html`,
  ];

  for (const url of urls) {
    logger.info(`[${SOURCE}] Scraping: ${url}`);
    const concours = await scrapePage(url);
    allConcours.push(...concours);
    await sleep(2000);
  }

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
