// src/components/ConcoursCard.jsx
const EMOJIS = {
  voyage: "✈️", "high-tech": "📱", gaming: "🎮", bon_achat: "🎁",
  mode_beaute: "👗", maison_cuisine: "🍳", culture: "📚",
  enfants: "🧸", sport: "⚽", spectacles: "🎭", beaute: "💄", divers: "🎯"
};

function Badge({ type }) {
  const map = {
    instant_gagnant: ["badge-instant", "⚡ Instant"],
    tirage: ["badge-tirage", "🎲 Tirage"],
    inscription_simple: ["badge-inscription", "✍️ Inscription"],
    score: ["badge-score", "🏅 Score"],
    creatif: ["badge-score", "🎨 Créatif"],
  };
  const [cls, label] = map[type] || ["badge-tirage", "Tirage"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function formatDate(d) {
  if (!d) return null;
  try {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

function isUrgent(d) {
  if (!d) return false;
  const diff = (new Date(d) - new Date()) / 86400000;
  return diff >= 0 && diff <= 3;
}

export default function ConcoursCard({ concours, onClick }) {
  const emoji = EMOJIS[concours.categorie] || "🎯";
  const urgent = isUrgent(concours.date_cloture);

  return (
    <div className="concours-card" onClick={onClick}>
      {concours.image_url ? (
        <img className="card-thumb" src={concours.image_url} alt={concours.titre} onError={e => e.target.style.display = 'none'} />
      ) : (
        <div className="card-thumb-placeholder">{emoji}</div>
      )}
      <div className="card-body">
        <div className="card-source">{concours.source}</div>
        <div className="card-title">{concours.titre}</div>
        {concours.lot && <div className="card-lot">{concours.lot}</div>}
        <div className="card-footer">
          <div className="badges">
            <Badge type={concours.type_mecanique} />
            {concours.frequence === "quotidien" && <span className="badge badge-quotidien">📅 Quotidien</span>}
            {urgent && <span className="badge badge-urgent">🔥 Bientôt clos</span>}
          </div>
          {concours.date_cloture && (
            <div className="card-date">📅 {formatDate(concours.date_cloture)}</div>
          )}
        </div>
      </div>
    </div>
  );
}


// src/components/ConcoursModal.jsx — dans le même fichier pour simplifier
export function ConcoursModal({ concours, onClose }) {
  const formatDate = (d) => {
    if (!d) return "Non précisée";
    try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{concours.titre}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {concours.lot && (
            <div className="modal-section">
              <div className="modal-label">🎁 Lots à gagner</div>
              <div className="modal-value">{concours.lot}</div>
              {concours.valeur_lot && <div style={{ color: "#00e5c8", fontSize: 13, marginTop: 4 }}>Valeur : {concours.valeur_lot}</div>}
            </div>
          )}
          <div className="modal-section" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div className="modal-label">📅 Date de clôture</div>
              <div className="modal-value">{formatDate(concours.date_cloture)}</div>
            </div>
            <div>
              <div className="modal-label">🎲 Type</div>
              <div className="modal-value">{concours.type_mecanique?.replace(/_/g, " ")}</div>
            </div>
            {concours.frequence && (
              <div>
                <div className="modal-label">🔄 Fréquence</div>
                <div className="modal-value">{concours.frequence}</div>
              </div>
            )}
          </div>
          {concours.reponses && (
            <div className="modal-section">
              <div className="modal-label">✅ Réponses aux questions</div>
              <div className="modal-reponses">{concours.reponses}</div>
            </div>
          )}
          <div className="modal-section">
            <div className="modal-label">🌐 Source</div>
            <div className="modal-value">{concours.source}</div>
          </div>
          <a className="modal-cta" href={concours.lien_direct} target="_blank" rel="noopener noreferrer">
            Participer au concours →
          </a>
        </div>
      </div>
    </div>
  );
}
