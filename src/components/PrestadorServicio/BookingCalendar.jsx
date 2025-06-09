import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';



export default function BookingCalendar({ events = [], onSelect }) {
  const [localEvents, setLocalEvents] = useState([]);

  const handleDateSelect = (selectInfo) => {
    if (onSelect) {
      onSelect(selectInfo);
      return;
    }
    const title = prompt('Título de la reserva:', 'Reserva');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      setLocalEvents([...localEvents, {
        id: String(localEvents.length),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      }]);
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      slotDuration="01:00:00"
      allDaySlot={false}
      selectable
      editable={false}
     events={events.length ? events : localEvents}
      select={handleDateSelect}
    />
  );
}