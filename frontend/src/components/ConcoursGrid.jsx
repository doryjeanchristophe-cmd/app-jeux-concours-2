// src/components/ConcoursGrid.jsx
import ConcoursCard from "./ConcoursCard";

export default function ConcoursGrid({ concours, loading, onSelect, total, offset, limit, onLoadMore }) {
  if (loading && concours.length === 0) {
    return (
      <div>
        <div className="grid-header">
          <div className="grid-count">Chargement...</div>
        </div>
        <div className="concours-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && concours.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🔍</div>
        <h3>Aucun concours trouvé</h3>
        <p>Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  const hasMore = offset + limit < total;

  return (
    <div>
      <div className="grid-header">
        <div className="grid-count">
          <strong>{concours.length}</strong> concours affichés sur <strong>{total}</strong>
        </div>
      </div>

      <div className="concours-grid">
        {concours.map(c => (
          <ConcoursCard key={c.id} concours={c} onClick={() => onSelect(c)} />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-wrap">
          <button className="load-more-btn" onClick={onLoadMore} disabled={loading}>
            {loading ? "Chargement..." : `Afficher plus (${total - concours.length} restants)`}
          </button>
        </div>
      )}
    </div>
  );
}
