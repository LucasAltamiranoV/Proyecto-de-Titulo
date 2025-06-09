import axios from 'axios';

const API_URL = 'http://localhost:4000/api/providers';

export const updateAvailability = async (token, disponibilidad) => {
  const res = await axios.put(
    `${API_URL}/disponibilidad`,
    { disponibilidad },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const uploadAvatar = async (id, token, file) => {
  const formData = new FormData();
  formData.append('imagen', file);
  const res = await axios.post(`${API_URL}/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};