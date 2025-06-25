// src/pages/All/BandejaEntrada.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import ChatRoom from '../../components/ChatRoom';
import axios from 'axios';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

export default function Inbox() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);

  // 1) Si llegamos desde "Iniciar chat"
  useEffect(() => {
    if (location.state?.contacto) {
      const { contactoId, contactoModel, nombre } = location.state.contacto;
      setSelected({ _id: contactoId, accountType: contactoModel, nombre });
    }
  }, [location.state]);

  // 2) Cargar últimos chats
  useEffect(() => {
    if (!user?._id || !user.accountType) return;

    const fetchContacts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/chat/ultimos/${user._id}/${user.accountType}`
        );

        const resultados = await Promise.all(
          res.data.map(async (c) => {
            const { contactoId, contactoModel, ultimoMensaje, fecha } = c;
            // Ajustamos la URL de detalle
            const perfilUrl =
              contactoModel === 'Provider'
                ? `http://localhost:4000/api/providers/detalle/${contactoId}`
                : `http://localhost:4000/api/users/perfil/${contactoId}`;

            let nombre = 'Sin nombre';
            try {
              const perfil = await axios.get(perfilUrl);
              nombre = perfil.data.nombre || nombre;
            } catch {
              console.warn(`No pude cargar perfil de ${contactoModel} ${contactoId}`);
            }

            return {
              contactoId,
              contactoModel,
              nombre,
              ultimoMensaje,
              fecha,
            };
          })
        );

        setContacts(resultados);
      } catch (err) {
        console.error('Error cargando contactos:', err);
      }
    };

    fetchContacts();
  }, [user]);

  if (!user) {
    return <p>Debes iniciar sesión para ver tus mensajes.</p>;
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={4} className="mb-4 sidebar">
          <Card>
            <Card.Header className="text-center">Mis Chats</Card.Header>
            <ListGroup variant="flush">
              {!contacts.length && !selected && (
                <ListGroup.Item className="text-center">
                  No tienes conversaciones aún.
                </ListGroup.Item>
              )}
              {contacts.map((c) => (
                <ListGroup.Item
                  key={c.contactoId}
                  action
                  onClick={() =>
                    setSelected({
                      _id: c.contactoId,
                      accountType: c.contactoModel,
                      nombre: c.nombre,
                    })
                  }
                  style={{
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <strong>{c.nombre}</strong> ({c.contactoModel})
                  <br />
                  <small className="text-muted">
                    {c.ultimoMensaje} • {new Date(c.fecha).toLocaleDateString()}{' '}
                    {new Date(c.fecha).toLocaleTimeString()}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
          {selected ? (
            <ChatRoom
              miUsuario={user}
              otroUsuario={selected}
            />
          ) : (
            <p className="text-muted">Selecciona una conversación</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}
