// src/components/ConcoursModal.jsx
export default function ConcoursModal({ concours, onClose }) {
  const formatDate = (d) => {
    if (!d) return "Non précisée";
    try {
      return new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric"
      });
    } catch { return d; }
  };

  const isUrgent = (d) => {
    if (!d) return false;
    const diff = (new Date(d) - new Date()) / 86400000;
    return diff >= 0 && diff <= 3;
  };

  const EMOJIS = {
    voyage: "✈️", "high-tech": "📱", gaming: "🎮", bon_achat: "🎁",
    mode_beaute: "👗", maison_cuisine: "🍳", culture: "📚",
    enfants: "🧸", sport: "⚽", spectacles: "🎭", beaute: "💄", divers: "🎯"
  };

  const emoji = EMOJIS[concours.categorie] || "🎯";

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        {/* Image ou placeholder */}
        {concours.image_url ? (
          <img
            src={concours.image_url}
            alt={concours.titre}
            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: "20px 20px 0 0" }}
            onError={e => e.target.style.display = "none"}
          />
        ) : (
          <div style={{
            width: "100%", height: 120,
            background: "var(--bg3)",
            borderRadius: "20px 20px 0 0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48
          }}>
            {emoji}
          </div>
        )}

        <div className="modal-header">
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
              {concours.source}
            </div>
            <div className="modal-title">{concours.titre}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {concours.type_mecanique && (
              <span className={`badge badge-${concours.type_mecanique === "instant_gagnant" ? "instant" : concours.type_mecanique === "tirage" ? "tirage" : "inscription"}`}>
                {concours.type_mecanique === "instant_gagnant" ? "⚡ Instant gagnant" :
                  concours.type_mecanique === "tirage" ? "🎲 Tirage au sort" : "✍️ Inscription simple"}
              </span>
            )}
            {concours.frequence && (
              <span className="badge badge-quotidien">📅 {concours.frequence}</span>
            )}
            {isUrgent(concours.date_cloture) && (
              <span className="badge badge-urgent">🔥 Expire bientôt !</span>
            )}
          </div>

          {/* Lot */}
          {concours.lot && (
            <div className="modal-section">
              <div className="modal-label">🎁 Lots à gagner</div>
              <div className="modal-value">{concours.lot}</div>
              {concours.valeur_lot && (
                <div style={{ color: "var(--accent3)", fontSize: 13, marginTop: 5, fontWeight: 500 }}>
                  Valeur estimée : {concours.valeur_lot}
                </div>
              )}
            </div>
          )}

          {/* Dates & infos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div className="modal-section" style={{ marginBottom: 0 }}>
              <div className="modal-label">📅 Date de clôture</div>
              <div className="modal-value" style={{ color: isUrgent(concours.date_cloture) ? "#ff5050" : undefined }}>
                {formatDate(concours.date_cloture)}
              </div>
            </div>
            <div className="modal-section" style={{ marginBottom: 0 }}>
              <div className="modal-label">📌 Catégorie</div>
              <div className="modal-value">{concours.categorie?.replace(/_/g, " ") || "Divers"}</div>
            </div>
          </div>

          {/* Réponses */}
          {concours.reponses && (
            <div className="modal-section">
              <div className="modal-label">✅ Réponses aux questions</div>
              <div className="modal-reponses">{concours.reponses}</div>
            </div>
          )}

          {/* Source */}
          <div className="modal-section">
            <div className="modal-label">🌐 Source</div>
            <div className="modal-value">{concours.source}</div>
          </div>

          {/* CTA */}
          <a
            className="modal-cta"
            href={concours.lien_direct}
            target="_blank"
            rel="noopener noreferrer"
          >
            Participer au concours →
          </a>
        </div>
      </div>
    </div>
  );
}
