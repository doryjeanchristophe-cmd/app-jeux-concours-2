// db.js — Initialisation de la base de données SQLite
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'concours.db');

function initDB() {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS concours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      organisateur TEXT,
      lot TEXT,
      valeur_lot TEXT,
      date_cloture TEXT,
      date_publication TEXT,
      type_mecanique TEXT,
      frequence TEXT,
      reponses TEXT,
      lien_direct TEXT UNIQUE,
      image_url TEXT,
      source TEXT,
      categorie TEXT,
      actif INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_source ON concours(source);
    CREATE INDEX IF NOT EXISTS idx_type ON concours(type_mecanique);
    CREATE INDEX IF NOT EXISTS idx_cloture ON concours(date_cloture);
    CREATE INDEX IF NOT EXISTS idx_actif ON concours(actif);
  `);

  return db;
}

module.exports = { initDB };
