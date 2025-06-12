import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Components/BusquedaRapida.css';

function BusquedaRapida() {
  const navigate = useNavigate();  // Usamos navigate para redirigir

  const oficios = [
    'FOTÓGRAFO', 'GÁSFITER', 'CERÁMICA', 'DEPILACIÓN',
    'SOLDADOR', 'OBRERO', 'ASEO DEL HOGAR', 'MANICURA',
  ];

  // Función que redirige a la búsqueda con el oficio
  const handleRedirectToSearch = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return;
    const encoded = encodeURIComponent(searchTerm.trim());
    navigate(`/search?q=${encoded}`);  // Redirige con el oficio como parámetro
  };

  return (
    <div className="busqueda-wrapper">
      <h3 className="busqueda-titulo">Búsqueda Rápida</h3>

      <div className="busqueda-container">
        {oficios.map((oficio, index) => (
          <div
            key={index}
            className="busqueda-item"
            onClick={() => handleRedirectToSearch(oficio)} // Redirige al hacer clic
          >
            {oficio}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusquedaRapida;
