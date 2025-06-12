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
// Función para agregar un evento
export async function agregarEvento(id, evento, token) {
  const response = await fetch(`${API_URL}/${id}/eventos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Pasamos el token correctamente
    },
    body: JSON.stringify(evento),
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Evento agregado exitosamente:', data);
  } else {
    console.error('Error al agregar evento:', data.error);
  }
}
// services/providerService.js
export const getProviderEvents = async (providerId, token) => {
  try {
    const response = await fetch(`${API_URL}/${providerId}/events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los eventos');
    }

    const events = await response.json();
    return events; // Deberías recibir los eventos en el formato adecuado
  } catch (error) {
    console.error('Error al recuperar eventos del proveedor:', error);
    throw error;
  }
};
// Función para obtener las solicitudes de eventos
export const getEventRequests = async ( providerId, token) => {
  try {
    const response = await axios.get(`${API_URL}/${providerId}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;  // Devuelve las solicitudes de eventos
  } catch (error) {
    console.error('Error al obtener solicitudes de eventos', error);
    throw new Error('No se pudieron obtener las solicitudes de eventos');
  }
};
// Función para aceptar una solicitud de evento
export const acceptEventRequest = async (providerId, requestId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${providerId}/events/accept`,
      { requestId },  // Pasa el requestId en el cuerpo de la solicitud
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Agregar el token de autenticación aquí
        },
      }
    );
    return response.data;  // Devuelve el resultado de la aceptación
  } catch (error) {
    console.error('Error al aceptar solicitud de evento', error);
    throw new Error('No se pudo aceptar la solicitud de evento');
  }
};

// Función para rechazar una solicitud de evento
export const rejectEventRequest = async (providerId, requestId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${providerId}/events/reject`,      
      { requestId }, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;  // Devuelve el resultado del rechazo
  } catch (error) {
    console.error('Error al rechazar solicitud de evento', error);
    throw new Error('No se pudo rechazar la solicitud de evento');
  }
};



// Función para solicitar un evento
export const solicitarEvento = async (proveedorId, titulo, clienteId, clienteNombre, inicio, fin, todoElDia) => {
  try {
    const response = await axios.post(
      `${API_URL}/eventos/solicitar`,
      {
      titulo,
      proveedorId,
      clienteId,
      clienteNombre,
      inicio,
      fin,
      todoElDia: todoElDia || false,
      }
    );

    return response.data;  // Devuelve el resultado de la solicitud
  } catch (error) {
    console.error('Error al solicitar evento front', error);
    throw new Error('No se pudo solicitar el evento');
  }
};


// Función para obtener las solicitudes de eventos del proveedor
export const getProviderEventRequests = async (providerId, token) => {
  try {
    const response = await axios.get(`${API_URL}/${providerId}/eventos/solicitudes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Devuelve las solicitudes de eventos
  } catch (error) {
    console.error('Error al obtener las solicitudes de eventos', error);
    throw new Error('No se pudieron obtener las solicitudes de eventos');
  }
};
