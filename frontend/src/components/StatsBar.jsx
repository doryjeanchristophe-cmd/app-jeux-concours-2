// src/components/StatsBar.jsx
export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-num accent">{stats.total}</div>
        <div className="stat-label">Concours actifs</div>
      </div>
      <div className="stat-card">
        <div className="stat-num accent3">{stats.instants}</div>
        <div className="stat-label">Instants gagnants</div>
      </div>
      <div className="stat-card">
        <div className="stat-num accent2">{stats.urgents}</div>
        <div className="stat-label">Expirent bientôt</div>
      </div>
      <div className="stat-card">
        <div className="stat-num">{stats.parSource?.length || 4}</div>
        <div className="stat-label">Sources scrapées</div>
      </div>
    </div>
  );
}
