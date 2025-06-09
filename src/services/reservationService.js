import axios from 'axios';
const API_URL = 'http://localhost:4000/api/reservations';

export const createReservation = async (data, token) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateReservationStatus = async (id, status, token) => {
  const res = await axios.put(`${API_URL}/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getProviderReservations = async (providerId, token) => {
  const url = `http://localhost:4000/api/providers/${providerId}/reservations`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(url, { headers });
  return res.data;
};