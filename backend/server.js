// server.js — Backend API Express (version production)
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const DB_PATH = process.env.DB_PATH ||
  path.join(__dirname, '..', '..', 'scraper-concours', 'concours.db');

function getDB() {
  if (!fs.existsSync(DB_PATH)) return null;
  return new Database(DB_PATH, { readonly: true });
}

app.get('/api/concours', (req, res) => {
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'Base de données non disponible.' });
  try {
    const { type, categorie, source, frequence, urgent, search, limit = 50, offset = 0, tri = 'date_cloture' } = req.query;
    let where = ['actif = 1'];
    const params = {};
    if (type) { where.push('type_mecanique = @type'); params.type = type; }
    if (categorie) { where.push('categorie = @categorie'); params.categorie = categorie; }
    if (source) { where.push('source = @source'); params.source = source; }
    if (frequence) { where.push('frequence = @frequence'); params.frequence = frequence; }
    if (urgent === 'true') where.push("date_cloture IS NOT NULL AND date_cloture <= date('now', '+3 days')");
    if (search) { where.push("(titre LIKE @search OR lot LIKE @search)"); params.search = `%${search}%`; }
    const orderBy = ['date_cloture','created_at','titre'].includes(tri) ? tri : 'created_at';
    const sql = `SELECT * FROM concours WHERE ${where.join(' AND ')} ORDER BY CASE WHEN date_cloture IS NULL THEN 1 ELSE 0 END, ${orderBy} ASC LIMIT @limit OFFSET @offset`;
    const items = db.prepare(sql).all({ ...params, limit: parseInt(limit), offset: parseInt(offset) });
    const { total } = db.prepare(`SELECT COUNT(*) as total FROM concours WHERE ${where.join(' AND ')}`).get(params);
    res.json({ total, limit: parseInt(limit), offset: parseInt(offset), items });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { db.close(); }
});

app.get('/api/concours/:id', (req, res) => {
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'Base de données non disponible' });
  try {
    const c = db.prepare('SELECT * FROM concours WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Non trouvé' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { db.close(); }
});

app.get('/api/stats', (req, res) => {
  const db = getDB();
  if (!db) return res.json({ total: 0, instants: 0, urgents: 0, parSource: [], parCategorie: [], parType: [], derniereScraping: null });
  try {
    const total = db.prepare("SELECT COUNT(*) as n FROM concours WHERE actif = 1").get().n;
    const instants = db.prepare("SELECT COUNT(*) as n FROM concours WHERE actif = 1 AND type_mecanique = 'instant_gagnant'").get().n;
    const urgents = db.prepare("SELECT COUNT(*) as n FROM concours WHERE actif = 1 AND date_cloture <= date('now', '+3 days')").get().n;
    const parSource = db.prepare("SELECT source, COUNT(*) as nb FROM concours WHERE actif = 1 GROUP BY source").all();
    const parCategorie = db.prepare("SELECT categorie, COUNT(*) as nb FROM concours WHERE actif = 1 GROUP BY categorie ORDER BY nb DESC").all();
    const parType = db.prepare("SELECT type_mecanique, COUNT(*) as nb FROM concours WHERE actif = 1 GROUP BY type_mecanique").all();
    const derniereScraping = db.prepare("SELECT MAX(created_at) as date FROM concours").get().date;
    res.json({ total, instants, urgents, parSource, parCategorie, parType, derniereScraping });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { db.close(); }
});

app.get('/api/nouveaux', (req, res) => {
  const db = getDB();
  if (!db) return res.status(503).json({ error: 'Base de données non disponible' });
  try {
    const items = db.prepare("SELECT * FROM concours WHERE actif = 1 AND date(created_at) = date('now') ORDER BY created_at DESC").all();
    res.json({ total: items.length, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { db.close(); }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`✅ API sur le port ${PORT}`));
