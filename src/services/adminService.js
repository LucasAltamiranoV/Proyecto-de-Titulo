import axios from 'axios';

const API_URL = 'http://localhost:4000/api/users';  

//CREAR UN USUARIO

// Función para crear un nuevo usuario
export const crearUsuario = async (usuarioData, token) => {
  try {
    console.log('Creando usuario con datos:', usuarioData);  // Log de los datos a crear

    const response = await axios.post(`${API_URL}/create`, usuarioData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Usuario creado:', response.data);  // Ver datos del usuario creado
    return response.data; // Devuelve el usuario creado
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};


// Función para actualizar los detalles de un usuario
export const actualizarUsuario = async (id, usuarioData, token) => {
  try {
    console.log('Actualizando usuario con ID:', id, 'y datos:', usuarioData);  // Log de la actualización

    const response = await axios.put(`${API_URL}/${id}/editar`, usuarioData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Usuario actualizado:', response.data);  // Ver datos del usuario actualizado
    return response.data; // Devuelve el usuario actualizado
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Función para eliminar un usuario
export const eliminarUsuario = async (id, token) => {
  try {
    console.log('Eliminando usuario con ID:', id);  // Log para saber el ID del usuario

    const response = await axios.delete(`${API_URL}/${id}/eliminar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Usuario eliminado:', response.data);  // Ver mensaje de éxito de eliminación
    return response.data; // Devuelve el mensaje de éxito
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

