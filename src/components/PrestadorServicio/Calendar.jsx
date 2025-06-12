import React, { useState, useEffect,useContext } from 'react'; 

import { AuthContext } from '../../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { agregarEvento, getProviderEvents, getProviderEventRequests,solicitarEvento } from '../../services/providerService';  // Asegúrate de tener la función getProviderEventRequests
import esLocale from '@fullcalendar/core/locales/es';

export default function Calendar(props) {
  const [currentEvents, setCurrentEvents] = useState([]);  // Eventos aprobados
  const [eventRequests, setEventRequests] = useState([]);  // Solicitudes de eventos
  const { user } = useContext(AuthContext);
  const clienteId = user?._id;  // Asumiendo que 'id' es el clienteId
const clienteNombre = user?.nombre;  // Asumiendo que 'nombre' es el clienteNombre
const accountType = user?.accountType || 'User'; // Usamos 'User' como valor por defecto si no existe accountType

  const { providerId } = props;

  // Recuperar los eventos y solicitudes de eventos del proveedor cuando el componente se monte
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token'); // O recupera el token de otra manera

        // Obtener los eventos aprobados
        const events = await getProviderEvents(providerId, token);
        const formattedEvents = events.map(event => ({
          title: event.titulo,
          start: event.inicio,  // Asegúrate de que 'inicio' sea una fecha en formato ISO
          end: event.fin,      // Asegúrate de que 'fin' sea una fecha en formato ISO
          allDay: event.todoElDia,
          backgroundColor: 'green',  // Color para eventos aprobados
        }));
        setCurrentEvents(formattedEvents);  // Establece los eventos aprobados en el estado

        // Obtener las solicitudes de eventos pendientes
        const eventRequests = await getProviderEventRequests(providerId, token);  // Recupera las solicitudes de eventos
        const formattedRequests = eventRequests.map(request => ({
          title: `Solicitud: ${request.clienteNombre}`,
          start: request.fecha, // La fecha de la solicitud
          allDay: true, // Todo el día
          backgroundColor: 'yellow',  // Color para solicitudes de eventos
        }));
        setEventRequests(formattedRequests);  // Establece las solicitudes en el estado
      } catch (error) {
        console.error('Error al obtener los eventos o solicitudes:', error);
      }
    };

    fetchEvents();
  }, [providerId]);  // Se ejecuta cuando cambia el `providerId`

  // Esta función maneja la creación de un nuevo evento cuando se selecciona una fecha
const handleDateSelect = async (selectInfo) => {
  let title = prompt('Por favor ingresa el título de tu evento');

  if (title) {
    // Crea un evento con los datos proporcionados
    const newEvent = {
      titulo: title,
      inicio: selectInfo.start.toISOString(), // Convierte la fecha a formato ISO
      fin: selectInfo.end.toISOString(),     // Convierte la fecha a formato ISO
      todoElDia: selectInfo.allDay,          // Si es todo el día o no
    };

    try {
      const token = localStorage.getItem('token'); // O recupera el token de otra manera

      // Verifica el tipo de cuenta y llama a la función correspondiente
      if (accountType === 'User') {
        // Si el accountType es 'User', llama a la función solicitarEvento
           await solicitarEvento(providerId, newEvent.titulo, clienteId, clienteNombre, newEvent.inicio, newEvent.fin, newEvent.todoElDia);

        alert('Solicitud creada con éxito');
      } else {
        // Si el accountType no es 'User', llama a la función agregarEvento
        await agregarEvento(providerId, newEvent, token);
        alert('Evento agregado con éxito');
      }

      // Si la llamada fue exitosa, actualiza los eventos en el estado
      setCurrentEvents((prevEvents) => [
        ...prevEvents,
        {
          title: newEvent.titulo,
          start: newEvent.inicio,
          end: newEvent.fin,
          allDay: newEvent.todoElDia,
          backgroundColor: 'green', // Color para los eventos agregados por el proveedor
        },
      ]);
    } catch (error) {
      console.error('Error al agregar el evento o solicitud:', error);
      alert('Hubo un problema al agregar el evento o la solicitud');
    }
  }
};


  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      locale={esLocale}  // Usar el idioma español
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={props.weekendsVisible}
      events={[...currentEvents, ...eventRequests]}  // Combina los eventos aprobados y las solicitudes
      select={handleDateSelect}  // Usamos la nueva función `handleDateSelect`
      eventContent={renderEventContent}
      eventClick={props.onEventClick}
      eventsSet={props.onEvents}
    />
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
