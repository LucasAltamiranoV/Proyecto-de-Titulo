// src/components/ImageDropdown.jsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hombre1 from '../assets/IconosUsuario/Hombre1.png';
import { AuthContext } from '../context/AuthContext';

const ImageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // DEBUG: mostrar usuario completo
  console.log('ImageDropdown user context:', user);

  // Determinar rol real: primero role, si no existe usar accountType
  const userRole = user?.role ?? user?.accountType;
  console.log('Detected userRole:', userRole);
  const isAdmin = userRole === 'admin';

  const toggleDropdown = () => setIsOpen(o => !o);

  const handleClickOutside = e => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = item => {
    console.log('Clicked menu item:', item);
    setIsOpen(false);

    switch (item.type) {
      case 'logout':
        logout();
        return navigate('/');
      case 'perfil':
        console.log('Navigating to perfil for role:', userRole);
        if (user.accountType === 'Provider') {
            return navigate('/provider/perfil');
          } else {
            return navigate(`/user/perfil/${user._id}`);
          }
      case 'navigate':
        return navigate(item.path);
      default:
        return;
    }
  };

  // Opciones básicas
  const baseItems = [
    { label: 'Perfil', type: 'perfil' },
    { label: 'Mensajes', type: 'navigate', path: '/bandeja' },
    { label: 'Soporte', type: 'navigate', path: '/soporte' },
  ];

  // Si es admin, añadir ítems extra
  const adminItems = isAdmin ? [
    { label: 'Panel Admin', type: 'navigate', path: '/admin' },
    { label: 'Gestión Usuarios', type: 'navigate', path: '/admin/usuarios' },
    { label: 'Reportes App', type: 'navigate', path: '/admin/reportes-app' },
    { label: 'Reportes Usuarios', type: 'navigate', path: '/admin/reportes-usuarios' },
  ] : [];
  console.log('adminItems:', adminItems);

  const logoutItem = [{ label: 'Cerrar sesión', type: 'logout' }];
  const menuItems = [...adminItems, ...baseItems, ...logoutItem];
  console.log('menuItems:', menuItems);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={Hombre1}
        alt="avatar"
        onClick={toggleDropdown}
        style={{ width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      />

      {isOpen && (
        <ul style={{
          position: 'absolute', top: 60, right: 0,
          background: '#fff', border: '1px solid #ccc', borderRadius: 8,
          padding: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          listStyle: 'none', margin: 0, zIndex: 1000, minWidth: 180
        }}>
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleNavigation(item)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                backgroundColor: hoveredIndex === idx ? '#bd4fca' : 'transparent',
                borderRadius: 6, fontSize: 15
              }}
            >{item.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImageDropdown;
