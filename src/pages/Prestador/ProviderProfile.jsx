import React, { useEffect, useState, useContext } from 'react';  
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Spinner,
  Button,
  Form,
  Image
} from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/ProfileCard';
import Calendar from '../../components/PrestadorServicio/Calendar';
import EventRequestTable from '../../components/PrestadorServicio/EventRequestTable';
import { getProviderProfile, getProviderEventRequests, acceptEventRequest, rejectEventRequest, uploadAvatar, updateDescription, agregarEvento, uploadGalleryImage  } from '../../services/providerService'; 

export default function MiPerfilProvider() {
  const { user, token } = useContext(AuthContext);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
   const [galleryFile, setGalleryFile] = useState(null); // archivo para galería
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
    //subir a la galería
    const handleGalleryChange = e => {
    setGalleryFile(e.target.files[0]);
  };

    const handleUploadGallery = async () => {
    if (!galleryFile) return;
    try {
      const galeriaActualizada = await uploadGalleryImage(user._id, token, galleryFile);
      setProviderData(prev => ({ ...prev, galeria: galeriaActualizada }));
      setGalleryFile(null);
    } catch (err) {
      console.error('Error al subir imagen de galería:', err);
    }
  };

  // Función para manejar la aceptación de una solicitud
  const handleAcceptRequest = async (request) => {
    try {
      const result = await acceptEventRequest(user._id, request._id, token);
      if (result.success) {
        const newEvent = {
          titulo: request.titulo,
          inicio: request.inicio,  // Asumiendo que las fechas están en formato ISO
          fin: request.fin,
          todoElDia: request.todoElDia,
          clienteId: request.clienteId

        };

        // Llamar a la función para agregar el evento al calendario
        await agregarEvento(user._id, newEvent, token);

            // 3) Envías el mensaje automático al cliente
        await axios.post('http://localhost:4000/api/chat/enviar', {
          emisorId:   user._id,             // quien envía: el proveedor
          emisorModel:'Provider',
          receptorId: request.clienteId,    // suponiendo que request.clienteId existe
          receptorModel: 'User',
          contenido:  `Tu solicitud de evento "${request.titulo}" para ${new Date(request.inicio).toLocaleString()} ha sido aceptada.`
        });

        await axios.post('http://localhost:4000/api/chat/enviar', {
          emisorId: user._id,
          emisorModel: 'Provider',
          receptorId: request.clienteId,
          receptorModel: 'User',
          contenido: `¿Cómo calificarías al proveedor por este servicio?`,
          tipo: 'calificacion',  // Tipo especial que tu frontend puede interpretar para renderizar <Valoracion />
          providerId: user._id   // Lo necesita el componente para saber a quién califica
      });

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

                    {/* Galería */}
          <div className="mt-4">
            <h5>Galería de trabajos</h5>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {providerData.galeria.map((url, idx) => (
                <Image
                  key={idx}
                  src={`http://localhost:4000${url}`}
                  thumbnail
                  style={{ width: 100, height: 100, objectFit: 'cover' }}
                />
              ))}
            </div>
            <Form.Group controlId="formGalleryUpload" className="d-flex gap-2">
              <Form.Control type="file" accept="image/*" onChange={handleGalleryChange} />
              <Button onClick={handleUploadGallery} disabled={!galleryFile}>
                Subir a Galería
              </Button>
            </Form.Group>
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
