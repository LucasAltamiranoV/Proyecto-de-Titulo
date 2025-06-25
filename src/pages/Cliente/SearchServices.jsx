// src/pages/SearchServices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BarraDeBusqueda from '../../components/BarraDeBusqueda';
import FilterButton from '../../components/FiltroBusqueda';
import CardPrestadorPerfil from '../../components/PrestadorServicio/CardPrestadorPerfil';
import { Valoracion } from '../../components/PrestadorServicio/Valoracion';
import { calcularPromedio } from '../../components/RenderizarPerfilesdestacados';
import axios from 'axios';

export default function SearchServices() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [term,    setTerm]    = useState('');
  const [region,  setRegion]  = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Lanza la búsqueda al backend
  const performSearch = async (newTerm, newRegion) => {
    const q = [newTerm.trim(), newRegion].filter(Boolean).join(' ');
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/auth/search?q=${encodeURIComponent(q)}`
      );
      setResults(data);
    } catch (err) {
      console.error('Error al buscar proveedores:', err);
      setError('Hubo un error al buscar. Intenta nuevamente.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Si llegan parámetros ?q=… por URL, pre-cargamos la búsqueda
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q') || '';
    setTerm(qParam);
    performSearch(qParam, region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Handlers de input y filtro
  const handleSearch = newTerm => {
    setTerm(newTerm);
    performSearch(newTerm, region);
  };

  const handleFilter = newRegion => {
    setRegion(newRegion);
    performSearch(term, newRegion);
  };

  const handleVerPerfil = profile =>
    navigate(`/provider/detalle/${profile._id}`);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Buscar Prestadores</h1>

      <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
        <BarraDeBusqueda onSearch={handleSearch} />
        <FilterButton region={region} onFilter={handleFilter} />
      </div>

      {loading && <p className="text-center">Cargando resultados...</p>}
      {error   && <p className="text-center text-danger">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="text-center">No se han encontrado resultados.</p>
      )}

      <div className="row justify-content-center">
        {results.map(profile => {
          const imageUrl = profile.imagenUrl
            ? `http://localhost:4000${profile.imagenUrl}`
            : '/default-avatar.png';

          // Calculamos la valoración promedio de este perfil
          const avgRating = calcularPromedio(profile.valoraciones || []);

          return (
            <div className="col-6 col-md-3 mb-3" key={profile._id}>
              <CardPrestadorPerfil
                imagenUrl={imageUrl}
                nombre={profile.nombre}
                oficio={Array.isArray(profile.servicios)
                  ? profile.servicios.join(', ')
                  : 'Servicio'}
                ubicacion={profile.ciudad}
                colorBarra="#bd4fca"
                colorEtiqueta="#f5a623"
                clickable
                onClick={() => handleVerPerfil(profile)}
              />
              <div className="text-center mt-2">
                <Valoracion rating={avgRating} maxRating={5} readOnly />
                <span> ({avgRating.toFixed(1)})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
