// src/components/Filters.jsx
const TYPES = [
  { value: "", label: "Tous" },
  { value: "instant_gagnant", label: "⚡ Instants gagnants" },
  { value: "tirage", label: "🎲 Tirage au sort" },
  { value: "inscription_simple", label: "✍️ Inscription simple" },
];

const CATEGORIES = [
  { value: "", label: "Toutes catégories" },
  { value: "voyage", label: "✈️ Voyages" },
  { value: "high-tech", label: "📱 High-Tech" },
  { value: "gaming", label: "🎮 Gaming" },
  { value: "bon_achat", label: "🎁 Bons d'achat" },
  { value: "mode_beaute", label: "👗 Mode & Beauté" },
  { value: "maison_cuisine", label: "🍳 Maison & Cuisine" },
  { value: "culture", label: "📚 Culture" },
  { value: "enfants", label: "🧸 Enfants" },
  { value: "sport", label: "⚽ Sport" },
];

export default function Filters({ filtres, onChange }) {
  return (
    <div className="filters">
      {TYPES.map(t => (
        <button
          key={t.value}
          className={`filter-btn ${filtres.type === t.value ? "active" : ""}`}
          onClick={() => onChange("type", t.value)}
        >
          {t.label}
        </button>
      ))}

      <div className="filter-sep" />

      <select
        className="filter-select"
        value={filtres.categorie}
        onChange={e => onChange("categorie", e.target.value)}
      >
        {CATEGORIES.map(c => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <button
        className={`filter-btn urgent ${filtres.urgent ? "active" : ""}`}
        onClick={() => onChange("urgent", !filtres.urgent)}
      >
        🔥 Expire bientôt
      </button>

      <div className="filter-sep" />

      <select
        className="filter-select"
        value={filtres.tri}
        onChange={e => onChange("tri", e.target.value)}
      >
        <option value="date_cloture">Trier : date de fin</option>
        <option value="created_at">Trier : plus récents</option>
        <option value="titre">Trier : A → Z</option>
      </select>
    </div>
  );
}
