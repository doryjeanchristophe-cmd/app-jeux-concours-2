// scrapers/concoursdunet.js — Scraper pour concours-du-net.com
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

const BASE_URL = 'https://www.concours-du-net.com';
const SOURCE = 'concours-du-net.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
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

function extractValeur(texte) {
  const match = texte.match(/\(?\s*(\d[\d\s]*)\s*[€$]\s*\)?/);
  return match ? match[1].replace(/\s/g, '') + '€' : null;
}

async function scrapePage(url) {
  const html = await fetchPage(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const concours = [];

  // concours-du-net.com structure : sections h3 + détails
  $('div.concours-item, section, li.jeu, div[class*="jeu"]').each((i, el) => {
    try {
      const titreEl = $(el).find('h2, h3, h4, .organisateur').first();
      const titre = titreEl.text().trim();
      if (!titre || titre.length < 2) return;

      // Lien vers la fiche du concours
      const lienEl = $(el).find('a[href*="jouer"], a[href*="concours"]').first();
      const lienHref = lienEl.attr('href');
      if (!lienHref) return;
      const lien = lienHref.startsWith('http') ? lienHref : BASE_URL + lienHref;

      // Lot à gagner
      const lotEl = $(el).find('strong, .lot, .cadeaux, .dotation').first();
      const lot = lotEl.text().trim();
      const valeurLot = extractValeur(lot);

      const texteBloc = $(el).text();

      // Date de clôture — format "Clôture le DD/MM/YYYY" ou "publié le XX/XX/XXXX. Clôture... le XX/XX/XXXX"
      const dateMatch = texteBloc.match(/[Cc]l[ôo]ture\s+des\s+participations?\s+le\s+(\d{2}\/\d{2}\/\d{4})/);
      const dateCloture = dateMatch ? dateMatch[1] : null;

      // Date de publication
      const pubMatch = texteBloc.match(/publi[ée]\s+le\s+(\d{2}\/\d{2}\/\d{4})/i);
      const datePub = pubMatch ? pubMatch[1] : new Date().toISOString().split('T')[0];

      // Image
      const imgEl = $(el).find('img').first();
      const imageUrl = imgEl.attr('src')
        ? (imgEl.attr('src').startsWith('http') ? imgEl.attr('src') : BASE_URL + imgEl.attr('src'))
        : null;

      // Type de mécanique
      let typeMecanique = 'tirage';
      const texteLower = texteBloc.toLowerCase();
      if (texteLower.includes('instant gagnant')) typeMecanique = 'instant_gagnant';
      else if (texteLower.includes('score')) typeMecanique = 'score';
      else if (texteLower.includes('créatif')) typeMecanique = 'creatif';
      else if (texteLower.includes('facebook') || texteLower.includes('instagram')) typeMecanique = 'reseaux_sociaux';

      // Réponses aux questions
      const reponsesMatch = texteBloc.match(/[Rr][ée]ponses?\s*[:\s]+(.+?)(?=Participer|Jeu-concours|$)/s);
      const reponses = reponsesMatch ? reponsesMatch[1].trim().substring(0, 500) : null;

      concours.push({
        titre,
        organisateur: titre,
        lot,
        valeur_lot: valeurLot,
        date_cloture: dateCloture,
        date_publication: datePub,
        type_mecanique: typeMecanique,
        frequence: null,
        reponses,
        lien_direct: lien,
        image_url: imageUrl,
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

  const urls = [
    `${BASE_URL}/nouveaux-jeux-concours.html`,
    `${BASE_URL}/concours-instants-gagnants.html`,
    `${BASE_URL}/concours-quotidiens.html`,
    `${BASE_URL}/meilleurs-jeux-concours.html`,
    `${BASE_URL}/concours-bientot-termines.html`,
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
