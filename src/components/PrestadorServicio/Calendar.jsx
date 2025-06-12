import React, { useState, useEffect } from 'react'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { agregarEvento, getProviderEvents, getProviderEventRequests,solicitarEvento } from '../../services/providerService';  // Asegúrate de tener la función getProviderEventRequests

export default function Calendar(props) {
  const [currentEvents, setCurrentEvents] = useState([]);  // Eventos aprobados
  const [eventRequests, setEventRequests] = useState([]);  // Solicitudes de eventos
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
        // Llama a la API para agregar el evento
        const token = localStorage.getItem('token'); // O recupera el token de otra manera
        await agregarEvento(providerId, newEvent, token);

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
        alert('Evento agregado con éxito');
      } catch (error) {
        console.error('Error al agregar el evento:', error);
        alert('Hubo un problema al agregar el evento');
      }
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
