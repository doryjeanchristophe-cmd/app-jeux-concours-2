// src/App.jsx — Application principale
import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import Filters from "./components/Filters";
import ConcoursGrid from "./components/ConcoursGrid";
import ConcoursModal from "./components/ConcoursModal";
import Footer from "./components/Footer";
import "./App.css";

const API = "http://localhost:3001/api";

export default function App() {
  const [concours, setConcours] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 24;

  const [filtres, setFiltres] = useState({
    search: "",
    type: "",
    categorie: "",
    urgent: false,
    tri: "date_cloture",
  });

  const fetchConcours = useCallback(async (newOffset = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: LIMIT,
        offset: newOffset,
        tri: filtres.tri,
        ...(filtres.type && { type: filtres.type }),
        ...(filtres.categorie && { categorie: filtres.categorie }),
        ...(filtres.urgent && { urgent: "true" }),
        ...(filtres.search && { search: filtres.search }),
      });
      const res = await fetch(`${API}/concours?${params}`);
      const data = await res.json();
      if (newOffset === 0) {
        setConcours(data.items || []);
      } else {
        setConcours(prev => [...prev, ...(data.items || [])]);
      }
      setTotal(data.total || 0);
      setOffset(newOffset);
    } catch (e) {
      console.error("Erreur API:", e);
    } finally {
      setLoading(false);
    }
  }, [filtres]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Erreur stats:", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchConcours(0);
  }, [fetchConcours]);

  const handleFiltreChange = (key, value) => {
    setFiltres(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadMore = () => fetchConcours(offset + LIMIT);

  return (
    <div className="app">
      <Header onSearch={v => handleFiltreChange("search", v)} />
      {stats && <StatsBar stats={stats} />}
      <main className="main">
        <Filters
          filtres={filtres}
          onChange={handleFiltreChange}
        />
        <ConcoursGrid
          concours={concours}
          loading={loading}
          onSelect={setSelected}
          total={total}
          offset={offset}
          limit={LIMIT}
          onLoadMore={handleLoadMore}
        />
      </main>
      {selected && (
        <ConcoursModal concours={selected} onClose={() => setSelected(null)} />
      )}
      <Footer />
    </div>
  );
}
