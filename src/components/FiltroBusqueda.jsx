// src/components/FilterButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/Components/FiltroBusqueda.css';

// `onFilter` recibe la función de filtrado; agregamos valor por defecto para evitar errores
const FilterButton = ({ region, onFilter = () => {} }) => {
  const [open, setOpen] = useState(false);
  const regions = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
    'Coquimbo', 'Valparaíso', 'Santiago', 'O’Higgins',
    'Maule', 'Ñuble', 'Biobío', 'La Araucanía',
    'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes y la Antártica Chilena',
  ];
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRegion = selected => {
    onFilter(selected);
    setOpen(false);
  };

  const handleRemoveFilter = () => onFilter(null);

  return (
    <div className="filtro-container" ref={ref}>
      <button
        className={`filtro-btn ${open ? 'open' : ''}`}
        type="button"
        onClick={() => setOpen(prev => !prev)}
      >
        <span>FILTRAR POR REGIÓN</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="icono-lista" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M2.5 12.5a.5.5 0 010-1h11a.5.5 0 010 1h-11zm0-4a.5.5 0 010-1h11a.5.5 0 010 1h-11zm0-4a.5.5 0 010-1h11a.5.5 0 010 1h-11z"/>
        </svg>
      </button>

      {open && (
        <ul className="filtro-dropdown">
          {regions.map((r, idx) => (
            <li key={idx} onClick={() => handleSelectRegion(r)}>
              {r}
            </li>
          ))}
        </ul>
      )}

      {region && (
        <div className="selected-filters">
          <span className="selected-region">
            {region} <button onClick={handleRemoveFilter}>❌</button>
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
