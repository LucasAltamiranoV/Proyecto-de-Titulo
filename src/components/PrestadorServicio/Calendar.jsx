import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { agregarEvento, getProviderEvents, getProviderEventRequests, solicitarEvento } from '../../services/providerService';
import esLocale from '@fullcalendar/core/locales/es';
import { Modal, Button, Form, Toast } from 'react-bootstrap';

export default function Calendar(props) {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const { user } = useContext(AuthContext);
  const clienteId = user?._id;
  const clienteNombre = user?.nombre;
  const accountType = user?.accountType || 'User';
  const { providerId } = props;

  // Estados para el modal y toast
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [pendingSelectInfo, setPendingSelectInfo] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const events = await getProviderEvents(providerId, token);
        const formattedEvents = events.map(event => ({
          title: event.titulo,
          start: event.inicio,
          end: event.fin,
          allDay: event.todoElDia,
          backgroundColor: 'green',
        }));
        setCurrentEvents(formattedEvents);

        const requests = await getProviderEventRequests(providerId, token);
        const formattedRequests = requests.map(req => ({
          title: `Solicitud: ${req.clienteNombre}`,
          start: req.fecha,
          allDay: true,
          backgroundColor: 'yellow',
        }));
        setEventRequests(formattedRequests);
      } catch (error) {
        console.error('Error al obtener los eventos o solicitudes:', error);
      }
    };

    fetchEvents();
  }, [providerId]);

  const handleDateSelect = (selectInfo) => {
    setPendingSelectInfo(selectInfo);
    setModalTitle('');
    setShowModal(true);
  };

  const handleModalConfirm = async () => {
    const selectInfo = pendingSelectInfo;
    setShowModal(false);
    if (!modalTitle) return;

    const newEvent = {
      titulo: modalTitle,
      inicio: selectInfo.start.toISOString(),
      fin: selectInfo.end.toISOString(),
      todoElDia: selectInfo.allDay,
    };

    try {
      const token = localStorage.getItem('token');
      if (accountType === 'User') {
        await solicitarEvento(providerId, newEvent.titulo, clienteId, clienteNombre, newEvent.inicio, newEvent.fin, newEvent.todoElDia);
        setToastMessage('Solicitud creada con éxito');
      } else {
        await agregarEvento(providerId, newEvent, token);
        setToastMessage('Evento agregado con éxito');
      }

      setCurrentEvents(prev => [
        ...prev,
        {
          title: newEvent.titulo,
          start: newEvent.inicio,
          end: newEvent.fin,
          allDay: newEvent.todoElDia,
          backgroundColor: 'green',
        }
      ]);
    } catch (error) {
      console.error('Error al agregar evento o solicitud:', error);
      setToastMessage('Hubo un problema al agregar el evento o la solicitud');
    } finally {
      setShowToast(true);
      setPendingSelectInfo(null);
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={esLocale}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        initialView="dayGridMonth"
        editable
        selectable
        selectMirror
        dayMaxEvents
        weekends={props.weekendsVisible}
        events={[...currentEvents, ...eventRequests]}
        select={handleDateSelect}
        eventContent={renderEventContent}
        eventClick={props.onEventClick}
        eventsSet={props.onEvents}
      />

      {/* Modal para título de evento */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Título del Evento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el título"
                value={modalTitle}
                onChange={e => setModalTitle(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleModalConfirm}>Crear</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast de confirmación */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Header>
          <strong className="me-auto">Calendario</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}
