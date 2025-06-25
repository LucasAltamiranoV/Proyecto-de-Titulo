// src/pages/SearchServices.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BarraDeBusqueda from '../../components/BarraDeBusqueda';
import FilterButton from '../../components/FiltroBusqueda';
import CardPrestadorPerfil from '../../components/PrestadorServicio/CardPrestadorPerfil';
import axios from 'axios';

function SearchServices() {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [term, setTerm]         = useState('');
  const [region, setRegion]     = useState(null);
  const navigate                = useNavigate();
  const location = useLocation();

  // Función única que ejecuta la búsqueda
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q') || '';
    setTerm(qParam);
    performSearch(qParam, region);
  }, [location.search]);

  // Handlers que actualizan estado y llaman al servicio único
  const handleSearch = (newTerm) => {
    setTerm(newTerm);
    performSearch(newTerm, region);
  };

  const handleFilter = (newRegion) => {
    setRegion(newRegion);
    performSearch(term, newRegion);
  };

  const handleViewProfile = (id) =>
    navigate(`/provider/detalle/${id}`);

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
