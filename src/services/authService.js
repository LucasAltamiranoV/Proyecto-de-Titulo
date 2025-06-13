// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth';

export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
  } catch (error) {
    // Re-lanzar el objeto de error que venga del servidor
    throw error.response?.data || { error: 'Error en la solicitud' };
  }
};

export const loginUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/login`, userData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error en la solicitud' };
  }
};


// Función para obtener todos los usuarios y proveedores
export const obtenerUsuariosYProveedores = async (token) => {
  try {
    console.log('Obteniendo todos los usuarios y proveedores con token:', token);

    const response = await axios.get(`${API_URL}/getAllUserSistem`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Usuarios y proveedores obtenidos:', response.data);
    return response.data; // Devuelve la lista de usuarios y proveedores
  } catch (error) {
    console.error('Error al obtener usuarios y proveedores:', error);
    throw error;
  }
};