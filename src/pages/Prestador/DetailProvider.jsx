import React, { useState, useEffect, useContext } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Valoracion} from '../../components/PrestadorServicio/Valoracion';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import Calendar from '../../components/PrestadorServicio/Calendar';
import { rateProvider } from '../../services/providerService';  
import { calcularPromedio } from '../../components/RenderizarPerfilesdestacados';
import '../../styles/PageStyles/DetailProvider.css';

 function deriveModel(user) {
    // Si no hay user, devolvemos un valor por defecto
    if (!user) return 'Guest';
    if (user.accountType) return user.accountType;
    // si tiene servicios, lo consideramos Provider
    if (Array.isArray(user.servicios)) return 'Provider';
    return 'User';
 }
export default function DetailProvider() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext); // obtener correctamente el usuario desde AuthContext
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);




  // Determinar el tipo de cuenta del usuario (User, Provider, etc.)
  const accountType = deriveModel(user);

  // Carga inicial del perfil del proveedor
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/api/providers/detalle/${id}`)
      .then(res => setProvider(res.data))
      .catch(err => console.error('Error al cargar proveedor:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = () => {
    if (!user) return navigate('/login');
    navigate('/inbox', {
      state: {
        contacto: {
          contactoId: provider._id,
          contactoModel: 'Provider',
          nombre: provider.nombre,
        },
      },
    });
  };

  // Función para solicitar un evento
  const handleEventRequest = (start, end) => {
    if (!user || !user.nombre) {
      console.error("El usuario no está autenticado correctamente");
      return;
    }
    const eventRequest = {
      proveedorId: provider._id,
      clienteId: user._id,
      clienteNombre: user.nombre,  // Asegúrate de que `user.nombre` esté disponible
      inicio: start, // La fecha seleccionada
      fin: end, // La fecha seleccionada
      todoElDia: true,  // Puedes modificar esto dependiendo de la selección del cliente
    };
  };

  if (loading) {
    return <div className="text-center my-5">Cargando proveedor...</div>;
  }

  if (!provider) {
    return <div className="text-center my-5">Proveedor no encontrado.</div>;
  }

    const imageUrl = provider.imagenUrl ? `http://localhost:4000${provider.imagenUrl}` : '/default-avatar.png';  // Reemplaza con la URL base del servidor
    const avgRating = calcularPromedio(provider.valoraciones);
  return (
    <div className="container mt-5">
      <div className="perfil-top d-flex flex-wrap">
        <div className="perfil-columna me-4">
          {imageUrl && (
            <div className="perfil-foto">
              <img src={imageUrl} alt="Foto del proveedor" className="img-fluid rounded-circle" />
            </div>
          )}

        <div className="text-center mt-2">
          <Valoracion rating={avgRating} maxRating={5} readOnly />
          <span>({avgRating.toFixed(1)})</span>
        </div>


          <div className="perfil-ubicacion d-flex align-items-center mb-3">
            <FaMapMarkerAlt className="me-2" />
            <span>{provider.ciudad || 'Ubicación no disponible'}</span>
          </div>

          <button className="btn btn-primary" onClick={handleChat}>
            Iniciar chat
          </button>
        </div>

        <div className="perfil-lado-derecho flex-fill">
          <h2 className="perfil-nombre">{provider.nombre}</h2>
          <p className="perfil-oficio text-muted">
            {Array.isArray(provider.servicios)
              ? provider.servicios.join(', ')
              : 'Servicios no disponibles'}
          </p>
          <p className="perfil-descripcion mt-3">
            {provider.descripcion || 'El proveedor no ha añadido descripción.'}
          </p>
        </div>
      </div>
      {/* Galería */}
      <h5>Galería de trabajos</h5>
      <div className="perfil-galeria d-flex flex-wrap gap-2 mt-4">
        {provider.galeria && provider.galeria.length > 0 ? (
          provider.galeria.map((url, idx) => (
            <div
              key={idx}
              className="galeria-imagen"
              style={{ width: '100px', height: '100px' }}
            >
              <img
                src={`http://localhost:4000${url}`}
                alt={`Galería ${idx + 1}`}
                className="img-fluid rounded"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))
        ) : (
          <p className="text-muted">No hay fotos de galería.</p>
        )}
      </div>

      <div className="mt-5">
        <h5 className="mt-4">Agenda tu reserva</h5>
          <div className="Calendar__container">
            <Calendar
              providerId={id}  // Pasa el ID del proveedor al calendario
              weekendsVisible={provider.weekendsVisible}
              initialEvents={provider.eventos}  // Pasa los eventos actuales del proveedor
              accountType={accountType}  // Pasa el tipo de cuenta al calendario
              onDateSelect={(selectInfo) => {
                const { start, end } = selectInfo;
                handleEventRequest(start, end); // Llama a la función para solicitar el evento
              }}
            />
          </div>
      </div>
    </div>
  );
}
