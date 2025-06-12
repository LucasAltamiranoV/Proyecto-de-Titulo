import React, { useEffect, useState, useContext } from 'react';  
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/ProfileCard';
import Calendar from '../../components/PrestadorServicio/Calendar';
import EventRequestTable from '../../components/PrestadorServicio/EventRequestTable';
import { getProviderProfile, getProviderEventRequests, acceptEventRequest, rejectEventRequest, uploadAvatar, updateDescription, agregarEvento } from '../../services/providerService'; 

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
        // Obtener las solicitudes de eventos para este proveedor
        const requests = await getProviderEventRequests(user._id, token);
        setEventRequests(requests);  // Establece las solicitudes de eventos
      } catch (err) {
        console.error('Error al obtener perfil o solicitudes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, token]);

  // Función para manejar la aceptación de una solicitud
  const handleAcceptRequest = async (request) => {
    try {
      const result = await acceptEventRequest(user._id, request._id, token);
      if (result.success) {
        // Crear el evento con los detalles de la solicitud
        const newEvent = {
          titulo: request.titulo,
          inicio: request.inicio,  // Asumiendo que las fechas están en formato ISO
          fin: request.fin,
          todoElDia: request.todoElDia,
        };

        // Llamar a la función para agregar el evento al calendario
        await agregarEvento(user._id, newEvent, token);

        // Eliminar la solicitud aceptada de la tabla
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
      const result = await rejectEventRequest(user._id, request._id, token);
      if (result.success) {
        // Eliminar la solicitud rechazada de la tabla
        setEventRequests((prevRequests) =>
          prevRequests.filter((r) => r.id !== request.id)  // Eliminar la solicitud rechazada
        );
      }
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
    }
  };

  // Función para manejar el cambio de imagen
    const handleImageChange = async (file) => {
      setImageFile(file);
      try {
        const data = await uploadAvatar(user._id, token, file);  // Llamamos al servicio para subir la imagen
        setProviderData(prev => ({ ...prev, imagenUrl: data.imagenUrl }));  // Actualiza la URL de la imagen en el estado
      } catch (err) {
        console.error('Error al guardar la imagen', err);
      }
    };



  // Función para guardar la imagen en el servidor
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
            data={providerData}                          
            onImageChange={handleImageChange}      
            onSaveDescription={handleSaveDescription} 
            imageField="imagenUrl"       // Pasa la clave para la imagen
            nameField="nombre"           // Pasa la clave para el nombre
            emailField="correo"          // Pasa la clave para el correo
            descriptionField="descripcion" // Pasa la clave para la descripción
          />

          <div className="mt-4">
            {/* Espacio añadido para la descripción del proveedor */}
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
              providerId={user._id} 
              weekendsVisible={providerData.weekendsVisible}
              initialEvents={providerData.eventos}
            />
          </div>
        </Col>
      </Row>

      {/* Movemos la tabla de solicitudes debajo del calendario */}
      <Row className="mt-4">
        <Col md={12}>
          <EventRequestTable
            eventRequests={eventRequests}  // Pasa las solicitudes de eventos al componente de la tabla
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        </Col>
      </Row>
    </Container>
  );
}
