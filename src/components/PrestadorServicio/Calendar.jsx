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
  const accountType = user?.accountType || 'User';
  const { providerId } = props;

  // Estados para el modal y toast
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [pendingSelectInfo, setPendingSelectInfo] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  useEffect(() => {
    fetchAll();
  }, [providerId]);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('token');
      // Eventos normales
      const events = await getProviderEvents(providerId, token);
      setCurrentEvents(events.map(e => ({
        title: e.titulo,
        start: e.inicio,
        end:   e.fin,
        allDay: e.todoElDia,
        backgroundColor: 'green',
      })));

      // Solicitudes
      const requests = await getProviderEventRequests(providerId, token);
      setEventRequests(requests.map(r => ({
        title: ` ${r.titulo}`,
        start: r.inicio,      // ← Aquí cambiamos fecha→inicio
        allDay: true,
        backgroundColor: 'yellow',
        textColor: 'black'  
      })));
    } catch (error) {
      console.error('Error al obtener eventos/solicitudes:', error);
    }
  };


  const handleDateSelect = (selectInfo) => {
    setPendingSelectInfo(selectInfo);
    setModalTitle('');
    setShowModal(true);
  };

const handleModalConfirm = async () => {
  const selectInfo = pendingSelectInfo;
  setShowModal(false);
  if (!modalTitle) return;

  const inicio = selectInfo.start.toISOString();
  const fin = selectInfo.end.toISOString();
  const todoElDia = selectInfo.allDay;

  try {
    const token = localStorage.getItem('token');

    if (accountType === 'User') {
      await solicitarEvento(
        providerId,
        modalTitle,
        user._id,
        user.nombre,
        inicio,
        fin,
        todoElDia
      );
      setToastMessage('Solicitud creada con éxito');
    } else {
      await agregarEvento(providerId, {
        titulo: modalTitle,
        inicio,
        fin,
        clienteId: user._id,
        todoElDia
      }, token);
      setToastMessage('Evento agregado con éxito');
    }
    setShowToast(true);
    await fetchAll();
    setModalTitle('');
    setPendingSelectInfo(null);
  } catch (error) {
    console.error('Error al confirmar evento:', error);
    setToastMessage('Error al crear evento');
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
