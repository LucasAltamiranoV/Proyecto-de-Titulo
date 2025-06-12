import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/ProfileCard';
import Calendar from '../../components/PrestadorServicio/Calendar';
import EventRequestTable from '../../components/PrestadorServicio/EventRequestTable';  // Importa el componente de la tabla de solicitudes
import { getProviderProfile } from '../../services/providerService';
import { acceptEventRequest, rejectEventRequest,uploadAvatar, updateDescription } from '../../services/providerService';  // Asegúrate de tener estas funciones


export default function MiPerfilProvider() {
  const { user, token } = useContext(AuthContext);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [eventRequests, setEventRequests] = useState([]);  // Estado para almacenar las solicitudes de eventos

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

  // Función para manejar la aceptación de una solicitud
  const handleAcceptRequest = async (request) => {
    try {
      // Llamar a la API para aceptar la solicitud, pasando providerId, request.id y token
      const result = await acceptEventRequest(user._id, request.id, token);
      if (result.success) {
        // Actualizar el estado de las solicitudes
        setEventRequests((prevRequests) =>
          prevRequests.filter((r) => r.id !== request.id)  // Eliminar la solicitud aceptada
        );
      }
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
    }
  };

  // Función para manejar el rechazo de una solicitud
  const handleRejectRequest = async (request) => {
    try {
      // Llamar a la API para rechazar la solicitud, pasando providerId, request.id y token
      const result = await rejectEventRequest(user._id, request.id, token);
      if (result.success) {
        // Eliminar la solicitud rechazada
        setEventRequests((prevRequests) =>
          prevRequests.filter((r) => r.id !== request.id)
        );
      }
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
    }
  };

  // Función para manejar el cambio de imagen
  const handleImageChange = (file) => {
    setImageFile(file);
  };

  // Función para guardar la imagen en el servidor
  const handleSaveImage = async () => {
    if (!imageFile) return;
    try {
      // Envía la imagen al servidor y actualiza el estado con la URL de la imagen
      const data = await uploadAvatar(user._id, token, imageFile);
      setProviderData(prev => ({ ...prev, imagenUrl: data.imagenUrl }));
      setImageFile(null);
    } catch (err) {
      console.error('Error al guardar la imagen', err);
    }
  };

  // Función para manejar la actualización de la descripción
  const handleSaveDescription = async (desc) => {
    try {
      const updated = await updateDescription(user._id, token, desc);
      setProviderData(prev => ({ ...prev, descripcion: updated.descripcion }));
    } catch (err) {
      console.error('Error al actualizar descripción', err);
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
            <Calendar
              providerId={user._id} // Pasa el ID del proveedor aquí como prop
              weekendsVisible={providerData.weekendsVisible} // Si necesitas pasar más props
              initialEvents={providerData.eventos} // O los eventos iniciales, si los tienes
            />
          </div>
        </Col>

        <Col md={4}>
          <EventRequestTable
            eventRequests={eventRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        </Col>
      </Row>
    </Container>
  );
}
