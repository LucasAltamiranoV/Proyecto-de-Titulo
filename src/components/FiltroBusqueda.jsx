import React, { useState, useRef, useEffect } from 'react';
import '../styles/Components/FiltroBusqueda.css';

const FilterButton = ({ onFilter }) => {
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null); // Estado para manejar la región seleccionada
  const [regions] = useState([
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Santiago',
    'O’Higgins',
    'Maule',
    'Ñuble',
    'Biobío',
    'La Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén',
    'Magallanes y la Antártica Chilena',
  ]); // Lista de regiones de Chile

  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRegion = (region) => {
    setSelectedRegion(region); // Establecer la región seleccionada
    setOpen(false); // Cerrar el desplegable
    if (onFilter) onFilter(region); // Llamar al callback onFilter para pasar la región seleccionada
  };

  const handleRemoveFilter = () => {
    setSelectedRegion(null); // Eliminar el filtro de región
    if (onFilter) onFilter(null); // Pasar null para eliminar el filtro
  };

  return (
    <div className="filtro-container" ref={ref}>
      <button
        className={`filtro-btn ${open ? 'open' : ''}`}
        type="button"
        onClick={() => setOpen(prev => !prev)}
      >
        <span>FILTRAR SERVICIO</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="icono-lista"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12.5a.5.5 0 010-1h11a.5.5 0 010 1h-11zm0-4a.5.5 0 010-1h11a.5.5 0 010 1h-11zm0-4a.5.5 0 010-1h11a.5.5 0 010 1h-11z"
          />
        </svg>
      </button>

      {open && (
        <ul className="filtro-dropdown">
          <li onMouseEnter={() => setOpen(true)} onClick={() => handleSelectRegion('Por ubicación')}>Por ubicación</li>
          <li onClick={() => handleSelectRegion('rating')}>Por valoración</li>
        </ul>
      )}

      {/* Desplegar las subcategorías de regiones cuando se selecciona "Por Ubicación" */}
      {open && selectedRegion === 'Por ubicación' && (
        <ul className="subcategorias-dropdown">
          {regions.map((region, index) => (
            <li key={index} onClick={() => handleSelectRegion(region)}>
              {region}
            </li>
          ))}
        </ul>
      )}

      {/* Mostrar la región seleccionada debajo del filtro */}
      {selectedRegion && selectedRegion !== 'Por ubicación' && (
        <div className="selected-filters">
          <span className="selected-region">
            {selectedRegion} <button onClick={handleRemoveFilter}>❌</button>
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
