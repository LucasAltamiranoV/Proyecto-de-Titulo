import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import imagenPerfil from '../../assets/imagenPerfil.jpeg'; // Imagen por defecto
import '../../styles/PageStyles/BandejaEntrada.css';

export default function BandejaEntrada() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [conversaciones, setConversaciones] = useState([]);

  useEffect(() => {
    if (!user?._id || !user.accountType) return;

    const fetchConversaciones = async () => {
      try {
        const res = await axios.get(
          `/api/chat/ultimos/${user._id}/${user.accountType}`
        );

        const resultados = await Promise.all(
          res.data.map(async (conv) => {
            const { contactoId, contactoModel, ultimoMensaje, fecha } = conv;
            // Ajustamos la ruta de perfil
            const urlPerfil =
              contactoModel === 'User'
                ? `/api/users/perfil/${contactoId}`
                : `/api/providers/detalle/${contactoId}`;

            let nombre = 'Sin nombre';
            let imagen = imagenPerfil; // Imagen predeterminada en caso de error
            try {
              const datos = await axios.get(urlPerfil);
              nombre = datos.data.nombre || nombre;
              imagen = datos.data.imagenUrl
                ? `http://localhost:4000${datos.data.imagenUrl}`
                : imagen;
            } catch {
              console.warn(
                `No se pudo obtener perfil de ${contactoModel} ${contactoId}`
              );
            }

            return {
              contactoId,
              contactoModel,
              nombre,
              imagen,
              ultimoMensaje,
              fecha,
            };
          })
        );

        setConversaciones(resultados);
      } catch (error) {
        console.error('Error al obtener conversaciones:', error);
      }
    };

    fetchConversaciones();
  }, [user]);

  const irAChat = (contacto) => {
    navigate('/inbox', { state: { contacto } });
  };

  if (!user) {
    return <p>Debes iniciar sesión para ver tu bandeja de entrada.</p>;
  }

  return (
    <div className="bandeja-container">
      <h2 className="titulo-bandeja">Bandeja de entrada</h2>
      {conversaciones.length === 0 && (
        <p className="sin-conversaciones">No tienes conversaciones aún.</p>
      )}
      {conversaciones.map((conv) => (
        <div
          key={conv.contactoId}
          className="bandeja-item"
          onClick={() => irAChat(conv)}
        >
          <img
            src={conv.imagen}
            alt="perfil"
            className="bandeja-avatar"
            onError={(e) => {
              e.target.src = imagenPerfil; // Usa la imagen por defecto si no se puede cargar
            }}
          />
          <div className="bandeja-info">
            <div className="bandeja-nombre">{conv.nombre}</div>
            <div className="bandeja-mensaje">{conv.ultimoMensaje}</div>
            <div className="bandeja-fecha">
              {new Date(conv.fecha).toLocaleDateString()}{' '}
              {new Date(conv.fecha).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
