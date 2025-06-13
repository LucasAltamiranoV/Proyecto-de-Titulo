import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/Components/BarraDeBusqueda.css';

function BarraDeBusqueda({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    } else {
      console.log('Buscando:', query); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Buscar oficios..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="search-icon" onClick={handleSearch}>
        <FaSearch />
      </button>
    </div>
  );
}

export default BarraDeBusqueda;
