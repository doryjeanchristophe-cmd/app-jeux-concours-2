// utils.js — Fonctions utilitaires partagées

// Détection de catégorie à partir du texte du lot
function detectCategorie(texte) {
  if (!texte) return 'divers';
  const t = texte.toLowerCase();

  if (t.match(/voyage|séjour|sejour|hotel|hôtel|avion|billet|week-end|vacances|croisière/)) return 'voyage';
  if (t.match(/voiture|auto|moto|scooter|vélo|velo|trottinette|tesla|renault|peugeot/)) return 'vehicule';
  if (t.match(/iphone|samsung|smartphone|téléphone|telephone|tablette|ipad|ordinateur|pc|mac|laptop/)) return 'high-tech';
  if (t.match(/playstation|ps5|xbox|nintendo|switch|console|jeu vidéo|jeu video/)) return 'gaming';
  if (t.match(/bon d'achat|bon dachat|carte cadeau|amazon|fnac|galeries|chèque|cheque/)) return 'bon_achat';
  if (t.match(/bijou|montre|bracelet|collier|bague|sac|vêtement|vetement|robe|chaussure|mode/)) return 'mode_beaute';
  if (t.match(/cuisine|robot|cookeo|thermomix|café|machine|nespresso|poele|casserole|gastronomie/)) return 'maison_cuisine';
  if (t.match(/livre|bd|bande dessinée|roman|magazine|dvd|blu-ray|musique|cd/)) return 'culture';
  if (t.match(/jouet|lego|enfant|bébé|bebe|puériculture|puericulture/)) return 'enfants';
  if (t.match(/cinema|théâtre|theatre|concert|spectacle|place|invitation|billet/)) return 'spectacles';
  if (t.match(/sport|fitness|vélo|velo|running|match|stade/)) return 'sport';
  if (t.match(/beauté|beaute|cosmétique|cosmetique|soin|parfum|maquillage|crème|creme/)) return 'beaute';

  return 'divers';
}

// Dédoublonnage global entre toutes les sources
function dedupliquer(allConcours) {
  const seen = new Set();
  return allConcours.filter(c => {
    // Clé unique : lien direct
    if (!c.lien_direct) return false;
    const key = c.lien_direct.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Vérifier si un concours est encore actif (date de clôture non dépassée)
function estActif(dateCloture) {
  if (!dateCloture) return true;
  try {
    const [jour, mois, annee] = dateCloture.split('/').map(Number);
    const dateC = new Date(annee, mois - 1, jour);
    return dateC >= new Date();
  } catch {
    return true;
  }
}

// Formater une date DD/MM/YYYY en ISO
function formatDate(dateFr) {
  if (!dateFr) return null;
  try {
    const [jour, mois, annee] = dateFr.split('/').map(Number);
    return new Date(annee, mois - 1, jour).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

// Rendre les fonctions disponibles globalement pour les scrapers
global.detectCategorie = detectCategorie;
global.estActif = estActif;
global.formatDate = formatDate;

module.exports = { detectCategorie, dedupliquer, estActif, formatDate };
