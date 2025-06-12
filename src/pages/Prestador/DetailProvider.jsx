import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Valoracion from '../../components/PrestadorServicio/Valoracion';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import BookingCalendar from '../../components/PrestadorServicio/BookingCalendar';
import { getProviderReservations, createReservation } from '../../services/reservationService';

export default function DetailProvider() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const handleSelect = async (info) => {
    if (!user) {
      alert('Debe iniciar sesión para reservar');
      return;
    }

    // Verificar que info.startStr esté definido antes de usarlo
    if (!info.startTime) {
      console.error('Error: startStr no está definido');
      alert('Hubo un problema al seleccionar la hora de la reserva. Intenta de nuevo.');
      return;
    }

    // Usar la fecha y hora de forma correcta
    const date = new Date(info.startTime).toISOString().split('T')[0];  // Fecha en formato YYYY-MM-DD
    const startTime = new Date(info.startTime).toISOString();  // Hora de inicio
    const endTime = new Date(info.endTime).toISOString();  // Hora de fin

    console.log('Intentando crear reserva con los siguientes datos:');
    console.log('Provider ID:', id);
    console.log('Date:', date);
    console.log('StartTime:', startTime);
    console.log('EndTime:', endTime);

    try {
      // Si el usuario es el proveedor, permitirle reservar para sí mismo
      if (user._id === id) {
        await createReservation({
          providerId: id,
          userId: user._id,
          date,
          startTime,
          endTime,
          isProvider: true // Indicamos que es el propio proveedor reservando
        }, token);
      } else {
        await createReservation({
          providerId: id,
          userId: user._id,
          date,
          startTime,
          endTime
        }, token);
      }

      // Actualizar los eventos del calendario después de crear la reserva
      const reservas = await getProviderReservations(id, token);
      const ev = reservas
        .filter(r => r.status === 'pending') // Filtramos las reservas pendientes
        .map(r => ({
          title: 'Reserva solicitada',
          start: r.startTime,  // Usamos startTime directamente
          end: r.endTime,  // Usamos endTime directamente
        }));
      setEvents(ev);

      alert('Reserva solicitada');
    } catch (err) {
      console.error('Error creando reserva:', err);
      alert('Hubo un error al crear la reserva. Por favor, inténtelo nuevamente.');
    }
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/api/providers/detalle/${id}`)
      .then(res => setProvider(res.data))
      .catch(err => console.error('Error al cargar proveedor:', err));

    getProviderReservations(id, token)
      .then(res => {
        const ev = res
          .filter(r => r.status === 'pending') // Solo mostrar reservas pendientes
          .map(r => ({
            title: 'Reserva solicitada',
            start: r.startTime,  // Usamos startTime directamente
            end: r.endTime,  // Usamos endTime directamente
          }));
        setEvents(ev);
      })
      .catch(err => console.error('Error al obtener reservas:', err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleChat = () => {
    if (!user) return navigate('/login');
    navigate('/inbox', {
      state: {
        contacto: {
          contactoId: provider._id,
          contactoModel: 'Provider',
          nombre: provider.nombre
        }
      }
    });
  };

  if (loading) {
    return <div className="text-center my-5">Cargando proveedor...</div>;
  }

  if (!provider) {
    return <div className="text-center my-5">Proveedor no encontrado.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="perfil-top d-flex flex-wrap">
        <div className="perfil-columna me-4">
          {provider.imagenUrl && (
            <div className="perfil-foto">
              <img src={provider.imagenUrl} alt="Foto del proveedor" />
            </div>
          )}

          <div className="mb-3">
            <Valoracion valor={provider.calificacion} readOnly />
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

        <div className="perfil-galeria d-flex flex-wrap gap-2 mt-3">
          {provider.galeria && provider.galeria.length > 0 ? (
            provider.galeria.map((url, idx) => (
              <div
                key={idx}
                className="galeria-imagen"
                style={{ width: '100px', height: '100px' }}
              >
                <img
                  src={url}
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
      </div>

      <div className="mt-5">
        <h5 className="mt-4">Agenda tu reserva</h5>
        <BookingCalendar
          events={events}
          onSelect={handleSelect} // Asignar la función de manejo de selección de fecha
        />
      </div>
    </div>
  );
}
