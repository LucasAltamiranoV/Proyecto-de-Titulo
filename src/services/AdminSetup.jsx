import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false); // Estado para controlar si ya existe el admin

  useEffect(() => {
    // Verificar si ya existe un admin
    const checkAdminExists = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/auth/check-admin');
        if (response.data.exists) {
          setAdminCreated(true); // Si ya existe un admin, no mostramos la pantalla de configuración
        }
      } catch (error) {
        console.error('Error al verificar admin existente:', error);
      }
    };

    checkAdminExists();
  }, []);

  // Crear el admin
  const createAdmin = async () => {
    const adminData = {
      nombre: 'Admin',
      correo: 'admin@admin.com',
      clave: 'admin123',
    };

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/auth/createAdmin', adminData);
      console.log('Admin creado correctamente:', response.data);
      setAdminCreated(true); // Una vez creado el admin, actualizamos el estado
    } catch (error) {
      console.error('Error al crear admin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (adminCreated) {
    return <div>El admin ya está configurado. Puedes continuar con la aplicación.</div>;
  }

  return (
    <div>
      <h2>Configuración inicial</h2>
      <p>Este paso es necesario para configurar al primer administrador del sistema.</p>
      <button onClick={createAdmin} disabled={loading}>
        {loading ? 'Creando admin...' : 'Crear Admin'}
      </button>
    </div>
  );
};

export default AdminSetup;
