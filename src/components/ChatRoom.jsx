// src/components/ChatRoom.jsx
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

/**
 * Deriva el modelo ('User' o 'Provider') a partir de la información
 * que tengamos del usuario. Si trae accountType lo usamos, sino
 * inferimos por la existencia de campos propios de Provider.
 */
function deriveModel(user) {
  if (user.accountType) return user.accountType;
  // si tiene servicios, lo consideramos Provider
  if (Array.isArray(user.servicios)) return 'Provider';
  return 'User';
}

export default function ChatRoom({ miUsuario, otroUsuario }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!miUsuario || !otroUsuario) return;

    const miModel     = deriveModel(miUsuario);


    // Conexión inicial
    socketRef.current = io('http://localhost:4000', {
      query: { userId: miUsuario._id, userModel: miModel }
    });

    socketRef.current.on('recibir-mensaje', mensaje => {
      const em = deriveModel(miUsuario),  rm = deriveModel(otroUsuario);
      const isSameConv =
        (mensaje.emisor === miUsuario._id &&
         mensaje.emisorModel === em &&
         mensaje.receptor === otroUsuario._id &&
         mensaje.receptorModel === rm) ||
        (mensaje.emisor === otroUsuario._id &&
         mensaje.emisorModel === rm &&
         mensaje.receptor === miUsuario._id &&
         mensaje.receptorModel === em);

      if (isSameConv) setMensajes(prev => [...prev, mensaje]);
    });

    socketRef.current.on('mensaje-guardado', m => {
      console.log('Mensaje guardado en BD:', m);
    });

    return () => socketRef.current.disconnect();
  }, [miUsuario, otroUsuario]);

  useEffect(() => {
    if (!miUsuario?._id || !otroUsuario?._id) return;
    const miModel   = deriveModel(miUsuario);
    const otroModel = deriveModel(otroUsuario);
    const url = `/api/chat/conversacion/${miUsuario._id}/${miModel}/${otroUsuario._id}/${otroModel}`;
    axios.get(url)
      .then(res => setMensajes(res.data))
      .catch(err => console.error('Error cargando historial:', err));
  }, [miUsuario, otroUsuario]);

  const enviarMensaje = () => {
    if (!texto.trim() || !socketRef.current) return;

    const emModel = deriveModel(miUsuario);
    const rcModel = deriveModel(otroUsuario);

    const payload = {
      emisorId: miUsuario._id,
      emisorModel: emModel,
      receptorId: otroUsuario._id,
      receptorModel: rcModel,
      contenido: texto
    };

    socketRef.current.emit('enviar-mensaje', payload);

    setMensajes(prev => [
      ...prev,
      {
        _id: 'pendiente_' + Date.now(),
        emisor: miUsuario._id,
        emisorModel: emModel,
        receptor: otroUsuario._id,
        receptorModel: rcModel,
        contenido: texto,
        enviadoEn: new Date().toISOString()
      }
    ]);
    setTexto('');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 10, marginTop: 20 }}>
      <h4>
        {miUsuario.nombre} ({deriveModel(miUsuario)}) ↔ {otroUsuario.nombre} ({deriveModel(otroUsuario)})
      </h4>
      <div style={{
        border: '1px solid #eee',
        height: 300,
        overflowY: 'auto',
        padding: 8,
        marginBottom: 10
      }}>
        {mensajes.map((m, idx) => {
          const soyYo = m.emisor === miUsuario._id && m.emisorModel === deriveModel(miUsuario);
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: soyYo ? 'flex-end' : 'flex-start',
                margin: '6px 0'
              }}
            >
              <div style={{
                backgroundColor: soyYo ? '#daf8cb' : '#f1f1f1',
                padding: '8px 12px',
                borderRadius: 8,
                maxWidth: '80%'
              }}>
                <div>{m.contenido}</div>
                <small style={{ fontSize: '0.7rem', color: '#555' }}>
                  {new Date(m.enviadoEn).toLocaleTimeString()}
                </small>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
          style={{ flex: 1, padding: '6px 8px' }}
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={enviarMensaje} style={{ padding: '6px 14px' }}>
          Enviar
        </button>
      </div>
    </div>
  );
}
