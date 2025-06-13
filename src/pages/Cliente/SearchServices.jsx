import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BarraDeBusqueda from '../../components/BarraDeBusqueda';
import FiltroBusqueda from '../../components/FiltroBusqueda';
import CardPrestadorPerfil from '../../components/PrestadorServicio/CardPrestadorPerfil';
import axios from 'axios';

function SearchServices() {
  const [results, setResults] = useState([]);  // Resultados de búsqueda
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const navigate = useNavigate();

  // Cada vez que cambie queryParam en la URL, hacemos la búsqueda
  useEffect(() => {
    const performSearch = async () => {
      if (!queryParam.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:4000/api/auth/search?q=${encodeURIComponent(queryParam)}`
        );
        setResults(response.data);
      } catch (err) {
        console.error('Error al buscar proveedores:', err);
        setError('Hubo un error al buscar. Intenta nuevamente.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [queryParam]);  // Vuelve a ejecutar cuando `q` cambie

  const handleSearch = (q) => {
    // Cambia el parámetro 'q' en la URL; dispara el useEffect
    setSearchParams({ q });
  };

  const handleViewProfile = (profileId) => {
    navigate(`/provider/detalle/${profileId}`);  // Redirigir al detalle del proveedor
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Buscar Prestadores</h1>

      <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
        {/* Pasamos handleSearch para que el usuario pueda buscar de nuevo */}
        <BarraDeBusqueda onSearch={handleSearch} />
        <FiltroBusqueda />
      </div>

      {loading && <p className="text-center">Cargando resultados...</p>}
      {error && <p className="text-center text-danger">{error}</p>}
      {!loading && results.length === 0 && !error && (
        <p className="text-center">No se han encontrado resultados.</p>
      )}

      <div className="row justify-content-center">
        {results.map((profile) => {
          // Asegúrate de que la imagen esté correctamente definida
          const imageUrl = profile.imagenUrl
            ? `http://localhost:4000${profile.imagenUrl}`  // Usa la URL completa para la imagen
            : '/default-avatar.png';  // Imagen predeterminada si no hay imagen

          return (
            <div className="col-6 col-md-3 mb-3" key={profile._id}>
              <CardPrestadorPerfil
                imagenUrl={imageUrl}  // Pasa la URL de la imagen
                nombre={profile.nombre}
                oficio={
                  Array.isArray(profile.servicios)
                    ? profile.servicios.join(', ')
                    : 'Servicio'
                }
                ubicacion={profile.ciudad}
                colorBarra="#bd4fca"
                colorEtiqueta="#f5a623"
                clickable={true}
                onClick={() => handleViewProfile(profile._id)}  // Redirige al hacer clic
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchServices;
