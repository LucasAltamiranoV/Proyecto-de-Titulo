import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CardPrestadorPerfil from './PrestadorServicio/CardPrestadorPerfil';
import { AuthContext } from '../context/AuthContext';
import {Valoracion} from './PrestadorServicio/Valoracion';

    // Función para calcular promedio
export const calcularPromedio = (valoraciones = []) => {
    if (!valoraciones.length) return 0;
    const suma = valoraciones.reduce((acc, v) => acc + (v.calificacion || 0), 0);
    return suma / valoraciones.length;
  };

const PerfilesDestacados = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Obtener TODOS los proveedores
        const response = await axios.get('http://localhost:4000/api/providers');
        setProfiles(response.data);
      } catch (error) {
        console.error('Error al obtener perfiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return <p className="text-center">Cargando perfiles...</p>;
  }

  if (profiles.length === 0) {
    return <p className="text-center">No hay perfiles disponibles.</p>;
  }

  const handleVerPerfil = (profile) => {
    navigate(`/provider/detalle/${profile._id}`);
  };

  const handleIniciarChatDirecto = (profile) => {
    if (!user || !user._id) {
      alert('Debes iniciar sesión para chatear con un proveedor.');
      return;
    }
    const contacto = {
      contactoId: profile._id,
      contactoModel: 'Provider'
    };
    navigate('/inbox', { state: { contacto } });
  };

  return (
    <section className="mb-4">
      <div className="row justify-content-center">
         {profiles.map((profile) => {
          const avgRating = calcularPromedio(profile.valoraciones);
          const imageUrl = profile.imagenUrl
            ? `http://localhost:4000${profile.imagenUrl}`
            : '/default-avatar.png';

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
                onClick={() => handleVerPerfil(profile)}
              />
               {/* Aquí mostramos la valoración promedio */}
              <div className="text-center mt-2">
                <Valoracion rating={avgRating} maxRating={5} readOnly />
                <span>({avgRating.toFixed(1)})</span>
              </div>

              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <button
                  onClick={() => handleVerPerfil(profile)}
                  style={{
                    marginRight: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ver perfil
                </button>
                <button
                  onClick={() => handleIniciarChatDirecto(profile)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Chatear
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PerfilesDestacados;
