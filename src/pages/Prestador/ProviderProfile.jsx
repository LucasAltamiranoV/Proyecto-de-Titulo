import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/ProfileCard';
import BookingCalendar from '../../components/PrestadorServicio/BookingCalendar';
import {
  getProviderProfile,
  uploadAvatar,
  updateDescription,
  getProviderReservations,
  updateReservationStatus
} from '../../services/providerService';
import '../../styles/PageStyles/ProviderProfile.css';

export default function MiPerfilProvider() {
  const { user, token } = useContext(AuthContext);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [reservations, setReservations] = useState([]);

  // Carga inicial del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id || user.accountType !== 'Provider') {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getProviderProfile(user._id, token);
        setProviderData(data);
      } catch (err) {
        console.error('Error al obtener perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, token]);

  // Cargar las reservas pendientes
  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?._id) return;
      try {
        const data = await getProviderReservations(user._id, token);
        console.log("Reservas obtenidas:", data); // Añadido para depuración
        setReservations(data);
      } catch (err) {
        console.error('Error al obtener reservas:', err);
      }
    };
    fetchReservations();
  }, [user, token]);

  // Guarda la nueva descripción
  const handleSaveDescription = async (desc) => {
    try {
      const updated = await updateDescription(user._id, token, desc);
      setProviderData(prev => ({ ...prev, descripcion: updated.descripcion }));
    } catch (err) {
      console.error('Error al actualizar descripción', err);
    }
  };

  // Cuando seleccionan imagen en ProfileCard
  const handleImageChange = (file) => setImageFile(file);

  // Envía la imagen al servidor
  const handleSaveImage = async () => {
    if (!imageFile) return;
    try {
      const data = await uploadAvatar(user._id, token, imageFile);
      setProviderData(prev => ({ ...prev, imagenUrl: data.imagenUrl }));
      setImageFile(null);
    } catch (err) {
      console.error('Error al guardar la imagen', err);
    }
  };

  // Confirmar reserva
  const handleConfirmReservation = async (reservationId) => {
    try {
      await updateReservationStatus(reservationId, 'accepted', token);
      setReservations(prev => prev.map(res =>
        res._id === reservationId ? { ...res, status: 'accepted' } : res
      ));
    } catch (err) {
      console.error('Error al confirmar reserva:', err);
    }
  };

  // Rechazar reserva
  const handleRejectReservation = async (reservationId) => {
    try {
      await updateReservationStatus(reservationId, 'rejected', token);
      setReservations(prev => prev.map(res =>
        res._id === reservationId ? { ...res, status: 'rejected' } : res
      ));
    } catch (err) {
      console.error('Error al rechazar reserva:', err);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!providerData) {
    return (
      <Container className="text-center my-5">
        <p>No se encontró al proveedor.</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <ProfileCard
            data={providerData}                    // Los datos del proveedor
            nameField="nombre"                     // Campo para el nombre
            emailField="correo"                    // Campo para el correo
            imageField="imagenUrl"                 // Campo para la imagen
            descriptionField="descripcion"         // Campo para la descripción
            onImageChange={handleImageChange}      // Función que maneja la imagen
            onSaveDescription={handleSaveDescription} // Función que maneja la descripción
          />

          <div className="mt-4">
            {/* Se añadió un espacio para el horario */}
          </div>

          <Button
            className="button-save-changes mt-3"
            onClick={handleSaveImage}
            disabled={!imageFile}
          >
            Guardar Cambios
          </Button>

          <div className="mt-4">
            <BookingCalendar
              events={reservations.filter(r => r.status === 'pending')} // Solo las reservas pendientes
              onSelect={(info) => {
                alert(`Reserva solicitada para esta hora: ${info.startStr}`);
              }} // Acción para mostrar la hora seleccionada
              onConfirmReservation={handleConfirmReservation} // Función para confirmar
              onRejectReservation={handleRejectReservation} // Función para rechazar
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
}
