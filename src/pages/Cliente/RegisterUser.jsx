// src/pages/Cliente/RegistroUsuario.jsx
import React from 'react';
import FormBase from '../../components/formularios/FormBase';
import TituloCrearInicio from '../../components/TituloCrearInicio';
import RegistroExitosoModal from '../../components/Popups/PopupRegistroExitoso';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/PageStyles/RegisterUser.css';
import { Link } from 'react-router-dom';

import { registerUser } from '../../services/authService';

const fieldsUsuario = [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Jimena Martínez',
    rules: { required: 'Obligatorio' }
  },
  {
    name: 'correo',
    label: 'Correo',
    type: 'email',
    placeholder: 'hola@ejemplo.com',
    rules: { required: 'Obligatorio' }
  },
  {
    name: 'clave',
    label: 'Clave',
    type: 'password',
    placeholder: '••••••••',
    rules: {
      required: 'Obligatorio',
      minLength: { value: 8, message: 'Mínimo 8 caracteres' }
    }
  },
  {
    name: 'confirmClave',
    label: 'Repetir clave',
    type: 'password',
    placeholder: '••••••••',
    rules: { required: 'Obligatorio' }
  }
];

export default function RegistroUsuario() {
  const [showModal, setShowModal] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleSubmit = async (data) => {
    setError(null); // Limpia errores previos

    // Validar que 'clave' y 'confirmClave' coincidan
    if (data.clave !== data.confirmClave) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Llamada al endpoint /api/auth/register
      await registerUser({
        nombre: data.nombre,
        correo: data.correo,
        clave: data.clave,
        // Para un registro de usuario normal, NO enviamos 'servicios'
      });
      setEmail(data.correo);
      setShowModal(true);
    } catch (err) {
      setError(err.error || 'Error inesperado');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-end">
        <div className="col-12 col-md-8">
          <TituloCrearInicio
            texto="Registro de Usuario"
            height="140px"
            fontSize="clamp(1.5rem, 5vw, 2.5rem)"
          />

          {error && (
            <div className="alert alert-danger text-center">
              {error}
            </div>
          )}

          <FormBase
            fields={fieldsUsuario}
            onSubmit={handleSubmit}
            submitLabel="Registrarse"
          />
        </div>
      </div>

      <RegistroExitosoModal
        show={showModal}
        correo={email}
        onClose={() => setShowModal(false)}
      />

      <div className="text-center mt-4">
        <Link to="/" className="btn btn-link">
          ¿Ya tienes cuenta? Inicia sesión aquí
        </Link>
      </div>
      <div className="text-center mt-4">
        <Link to="/registerprovider" className="btn btn-link">
          ¿Quieres ofrecer tus servicios?
        </Link>
      </div>
    </div>
  );
}
