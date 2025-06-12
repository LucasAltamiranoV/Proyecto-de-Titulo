import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/ProfileCard';
import Calendar from '../../components/PrestadorServicio/Calendar';
import '../../styles/PageStyles/ProviderProfile.css';
import { getProviderProfile, updateDescription, uploadAvatar } from '../../services/providerService';

export default function MiPerfilProvider() {
  const { user, token } = useContext(AuthContext);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

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
      </Row>
    </Container>
  );
}
