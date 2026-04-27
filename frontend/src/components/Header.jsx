// src/components/Header.jsx
import { useState } from "react";

export default function Header({ onSearch }) {
  const [val, setVal] = useState("");

  const handleChange = (e) => {
    setVal(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-badge">🏆</div>
        Gagnez<span>Facile</span>
      </div>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Chercher un concours, un lot..."
          value={val}
          onChange={handleChange}
        />
      </div>
    </header>
  );
}
