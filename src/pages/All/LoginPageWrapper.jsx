// src/pages/Login/LoginPageWrapper.jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoginPage from './Login';

export default function LoginPageWrapper() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    // 1) Limpiar error previo para forzar re-render si vuelve a fallar
    setError(null);

    try {
      await login(credentials);
      navigate('/home');
    } catch (e) {
      // 2) Poner el nuevo error (aunque sea el mismo texto)
      setError(e.error || 'Correo o clave incorrectos');
    }
  };

  return <LoginPage onLogin={handleLogin} error={error} />;
}
