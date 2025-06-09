// src/pages/ProviderProfile.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/ProfileCard';
import HorarioEditable from '../../components/HorarioEditable';
import { updateAvailability, uploadAvatar } from '../../services/providerService';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import BookingCalendar from '../../components/PrestadorServicio/BookingCalendar'
import '../../styles/PageStyles/ProviderProfile.css';

export default function MiPerfilProvider() {
  const { user, token } = useContext(AuthContext);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

   const handleSaveDescription = async (desc) => {
    try {
      const url = 'http://localhost:4000/api/providers/descripcion';
      const res = await axios.put(
        url,
        { descripcion: desc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProviderData(res.data);
    } catch (error) {
      console.error('Error al actualizar descripción', error.response?.data || error);
    }
  };
  

  useEffect(() => {
    console.log('🏷️ AuthContext.user =', user);
    console.log('🔑 token =', token);

    // Asegurarnos de que sea un proveedor
    if (!user?._id || user.accountType !== 'Provider') {
      console.warn('No hay provider logueado o userModel distinto de Provider');
      setLoading(false);
      return;
    }

    setLoading(true);

    const url = 'http://localhost:4000/api/providers/perfil';
    console.log('📡 Llamando a:', url);

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        console.log('✅ /perfil response.data =', res.data);
        setProviderData(res.data);
      })
      .catch(err => {
        console.error('❌ Error al obtener mi perfil:', err.response?.data || err);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleImageChange = file => setImageFile(file);

  const handleSaveChanges = async () => {
    if (!imageFile) return;
    try {
      const res = await uploadAvatar(user._id, token, imageFile);
      setProviderData(prev => ({ ...prev, imagenUrl: res.imagenUrl }));
    } catch (error) {
      console.error('❌ Error al guardar la imagen', error.response?.data || error);
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
            nameField="nombre"
            emailField="correo"
            imageField="imagenUrl"
            descriptionField="descripcion"
          onImageChange={handleImageChange}
          onSaveDescription={handleSaveDescription}
        >
  
        </ProfileCard>

        <Button
          className="button-save-changes mt-3"
          onClick={handleSaveChanges}
          disabled={!imageFile}
        >
          Guardar Cambios
        </Button>
        <div className="mt-4">
          <BookingCalendar />
        </div>
      </Col>
    </Row>
  </Container>
  );
}
