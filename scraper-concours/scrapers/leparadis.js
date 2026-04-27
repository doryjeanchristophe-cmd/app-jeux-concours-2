// scrapers/leparadis.js — Scraper pour leparadisdesjeuxconcours.fr
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

const BASE_URL = 'https://www.leparadisdesjeuxconcours.fr';
const SOURCE = 'leparadisdesjeuxconcours.fr';

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

async function scrapePage(url) {
  const html = await fetchPage(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const concours = [];

  // Sur leparadis, chaque concours est un bloc avec image + texte
  $('a[href]').each((i, el) => {
    try {
      const lien = $(el).attr('href');
      if (!lien || (!lien.startsWith('http') && !lien.startsWith('/'))) return;

      const img = $(el).find('img').first();
      if (!img.length) return;

      const imageUrl = img.attr('src') || null;
      const parentText = $(el).parent().text();

      // Extraction titre depuis le texte suivant le lien
      const nextText = $(el).next('p, div, span').text().trim() ||
        $(el).parent().find('p').first().text().trim();

      // Extraction date de clôture
      const dateMatch = parentText.match(/Date de cl[ôo]ture\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
      const dateCloture = dateMatch ? dateMatch[1] : null;

      // Extraction du titre depuis les balises proches
      const titreEl = $(el).closest('div, section').find('strong, b, h2, h3').first();
      const titre = titreEl.text().trim() || nextText.split('\n')[0].trim();

      if (!titre || titre.length < 3) return;

      // Extraction du type de mécanique
      let typeMecanique = 'tirage';
      if (parentText.toLowerCase().includes('instant gagnant')) typeMecanique = 'instant_gagnant';
      else if (parentText.toLowerCase().includes('inscription simple')) typeMecanique = 'inscription_simple';
      else if (parentText.toLowerCase().includes('tirage')) typeMecanique = 'tirage';

      // Extraction des réponses
      const reponsesMatch = parentText.match(/[Rr][ée]ponses?\s*:([^P]+?)(?=Publié|$)/s);
      const reponses = reponsesMatch ? reponsesMatch[1].trim() : null;

      const lienFinal = lien.startsWith('http') ? lien : BASE_URL + lien;

      concours.push({
        titre,
        organisateur: titre,
        lot: nextText.replace(titre, '').trim() || null,
        valeur_lot: null,
        date_cloture: dateCloture,
        date_publication: new Date().toISOString().split('T')[0],
        type_mecanique: typeMecanique,
        frequence: null,
        reponses,
        lien_direct: lienFinal,
        image_url: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
        source: SOURCE,
        categorie: detectCategorie(nextText),
      });
    } catch (err) {
      logger.warn(`[${SOURCE}] Erreur parsing: ${err.message}`);
    }
  });

  // Dédoublonnage interne
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
    `${BASE_URL}/jeux-concours-instants-gagnants/`,
    `${BASE_URL}/les-meilleurs-jeux-concours/`,
    `${BASE_URL}/`,
  ];

  for (const url of urls) {
    logger.info(`[${SOURCE}] Scraping: ${url}`);
    const concours = await scrapePage(url);
    allConcours.push(...concours);
    await sleep(2500);
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
