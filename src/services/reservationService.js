import axios from 'axios';

const API_URL = 'http://localhost:4000/api/reservations';

// Crear una nueva reserva
export const createReservation = async (data, token) => {
  try {
    const res = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error creando reserva:', error);
    throw new Error('Error al crear reserva');
  }
};

// Actualizar el estado de una reserva (aceptar/rechazar)
export const updateReservationStatus = async (id, status, token) => {
  try {
    const res = await axios.put(`${API_URL}/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error actualizando estado de reserva:', error);
    throw new Error('Error al actualizar estado de la reserva');
  }
};

// Obtener todas las reservas de un proveedor
export const getProviderReservations = async (providerId, token) => {
  const url = `http://localhost:4000/api/providers/${providerId}/reservations`;
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const res = await axios.get(url, { headers });
    return res.data;
  } catch (error) {
    console.error('Error obteniendo las reservas del proveedor:', error);
    throw new Error('Error al obtener las reservas del proveedor');
  }
};
