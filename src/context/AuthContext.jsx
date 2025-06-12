// src/contexts/AuthContext.jsx
import { createContext, useState } from 'react';
import { loginUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // En lugar de un único estado “user”, separo token + userData
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    // Si ya hay token en localStorage, podemos recuperar userId y userModel
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Función para hacer login
  const login = async (credentials) => {
    const data = await loginUser(credentials);
    // data debería incluir { token, user: { _id, name, email, userModel, ... } }
    setToken(data.token);
    setUser(data.user);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // (Opcional) aquí podrías validar en un useEffect que el token siga vigente, etc.

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
