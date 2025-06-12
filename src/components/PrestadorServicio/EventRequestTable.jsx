import React from 'react';
import { Table, Button } from 'react-bootstrap';

const EventRequestTable = ({ eventRequests, onAccept, onReject }) => {
  return (
    <div className="mt-4">
      <h5>Solicitudes de eventos</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Fecha de Solicitud</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {eventRequests.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">No hay solicitudes pendientes</td>
            </tr>
          ) : (
            eventRequests.map((request, index) => {
              // Verificamos si la fecha es válida antes de mostrarla
              const startDate = new Date(request.inicio);
              const endDate = new Date(request.fin);

              // Si las fechas son válidas
              const formattedStartDate = startDate instanceof Date && !isNaN(startDate) 
                ? startDate.toLocaleDateString() + ' ' + startDate.toLocaleTimeString() 
                : 'Fecha inválida';

              const formattedEndDate = endDate instanceof Date && !isNaN(endDate) 
                ? endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString() 
                : 'Fecha inválida';

              return (
                <tr key={index}>
                  <td>{request.clienteNombre}</td>
                  <td>{`${formattedStartDate} - ${formattedEndDate}`}</td> {/* Muestra la fecha de inicio y fin */}
                  <td>
                    <Button variant="success" onClick={() => onAccept(request)}>
                      Aceptar
                    </Button>
                    <Button variant="danger" className="ms-2" onClick={() => onReject(request)}>
                      Rechazar
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default EventRequestTable;
