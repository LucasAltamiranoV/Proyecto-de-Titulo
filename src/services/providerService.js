import axios from 'axios';

const API_URL = 'http://localhost:4000/api/providers';

// Obtiene el perfil del proveedor autenticado
export const getProviderProfile = async (id, token) => {
  try {
    const res = await axios.get(`${API_URL}/perfil/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener perfil del proveedor:', error);
    throw new Error('No se pudo obtener el perfil del proveedor');
  }
};

// Sube la imagen de perfil a /:id/avatar
export const uploadAvatar = async (id, token, file) => {
  const formData = new FormData();
  formData.append('imagen', file);
  try {
    const res = await axios.post(`${API_URL}/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error al subir la imagen de perfil:', error);
    throw new Error('No se pudo subir la imagen de perfil');
  }
};

// Sube imágenes a la galería
export const uploadGalleryImage = async (id, token, file) => {
  const formData = new FormData();
  formData.append('imagen', file);
  try {
    const res = await axios.post(`${API_URL}/${id}/gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error al subir foto de galería:', error);
    throw new Error('No se pudo subir la foto de la galería');
  }
};

// Califica al proveedor
export const rateProvider = async (id, token, rating) => {
  try {
    const res = await axios.post(
      `${API_URL}/${id}/rate`,
      { rating },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error al calificar proveedor:', error);
    throw new Error('No se pudo calificar al proveedor');
  }
};

// Actualiza la descripción del proveedor
export const updateDescription = async (id, token, descripcion) => {
  try {
    const res = await axios.put(
      `${API_URL}/${id}/descripcion`,
      { descripcion },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error al actualizar descripción:', error);
    throw new Error('No se pudo actualizar la descripción del proveedor');
  }
};

// Actualiza el estado de la reserva (aceptar o rechazar)
export const updateReservationStatus = async (reservationId, status, token) => {
  try {
    const res = await axios.put(
      `http://localhost:4000/api/reservations/${reservationId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error al actualizar estado de la reserva:', error);
    throw new Error('No se pudo actualizar el estado de la reserva');
  }
};

// Función para obtener las reservas de un proveedor
export const getProviderReservations = async (providerId, token) => {
  try {
    const res = await axios.get(`${API_URL}/${providerId}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener reservas del proveedor:', error);
    throw new Error('No se pudieron obtener las reservas del proveedor');
  }
};
