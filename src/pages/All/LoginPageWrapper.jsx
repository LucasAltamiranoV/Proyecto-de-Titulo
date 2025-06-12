
// LoginPageWrapper.jsx  es un componente envoltorio que:
// Importa y usa el AuthContext para llamar a la función login.
// Maneja el estado de error.
// Usa useNavigate para redirigir al home si el login es exitoso.
// Renderiza el LoginPage pasándole la función onLogin y los posibles errores.
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import LoginPage from './Login';


export default function LoginPageWrapper() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    console.log('handleLogin ejecutado con:', credentials);  // aquí debe ir
    try {
      await login(credentials);
      navigate('/home');  
    } catch (e) {
      setError(e.error || 'Error al iniciar sesión');
    }
  };

  return <LoginPage onLogin={handleLogin} error={error} />;
}
