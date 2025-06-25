// src/components/BusquedaRapida.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Components/BusquedaRapida.css';

const oficios = [
  'FOTÓGRAFO', 'GÁSFITER', 'CERÁMICA', 'DEPILACIÓN',
  'SOLDADOR', 'OBRERO', 'ASEO DEL HOGAR', 'MANICURA',
];

export default function BusquedaRapida() {
  const navigate = useNavigate();

  const handleRedirectToSearch = (searchTerm) => {
    const encoded = encodeURIComponent(searchTerm.trim());
      navigate(`/search?q=${encoded}`);
  };

  return (
    <div className="busqueda-wrapper">
      <h3 className="busqueda-titulo">Búsqueda Rápida</h3>
      <div className="busqueda-container">
        {oficios.map((oficio, idx) => (
          <button
            key={idx}
            className="busqueda-item"
            onClick={() => handleRedirectToSearch(oficio)}
          >
            {oficio}
          </button>
        ))}
      </div>
    </div>
  );
}
