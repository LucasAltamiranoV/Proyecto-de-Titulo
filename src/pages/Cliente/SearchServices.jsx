
// src/pages/SearchServices.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BarraDeBusqueda from '../../components/BarraDeBusqueda';
import FilterButton from '../../components/FiltroBusqueda';
import CardPrestadorPerfil from '../../components/PrestadorServicio/CardPrestadorPerfil';
import axios from 'axios';

function SearchServices() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const combinedParam = searchParams.get('q') || '';

  // Estados individuales para término y región
  const [term, setTerm]   = useState('');
  const [region, setRegion] = useState(null);

  const navigate = useNavigate();

  // Sincronizar estados term y region con la query inicial
  useEffect(() => {
    const parts = combinedParam.split(/\s+/);
    const last = parts.pop();
    if (FilterButtonRegions.includes(last)) {
      setRegion(last);
      setTerm(parts.join(' '));
    } else {
      setTerm(combinedParam);
    }
  }, [combinedParam]);

  useEffect(() => {
    const fetchData = async () => {
      if (!combinedParam.trim()) return setResults([]);
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://localhost:4000/api/auth/search?q=${encodeURIComponent(combinedParam)}`
        );
        setResults(res.data);
      } catch (err) {
        console.error(err);
        setError('Hubo un error al buscar.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [combinedParam]);

  const handleSearch = q => {
    setTerm(q);
    const combined = region ? `${q} ${region}` : q;
    setSearchParams({ q: combined });
  };

  const handleFilter = r => {
    setRegion(r);
    const combined = r ? `${term} ${r}` : term;
    setSearchParams({ q: combined });
  };

  const handleViewProfile = id => navigate(`/provider/detalle/${id}`);

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
                onClick={() => handleViewProfile(profile._id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchServices;

const FilterButtonRegions = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
  'Coquimbo', 'Valparaíso', 'Santiago', 'O’Higgins',
  'Maule', 'Ñuble', 'Biobío', 'La Araucanía',
  'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes y la Antártica Chilena',
];
