import React from 'react'; 
import { Table, Button } from 'react-bootstrap';

const EventRequestTable = ({ eventRequests, onAccept, onReject }) => {
  return (
    <div className="mt-4">
      <h5>Solicitudes de eventos</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Título</th>               {/* Nueva columna */}
            <th>Cliente</th>
            <th>Fecha de Solicitud</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {eventRequests.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay solicitudes pendientes
              </td>
            </tr>
          ) : (
            eventRequests.map((request, index) => {
              const startDate = new Date(request.inicio);
              const endDate   = new Date(request.fin);

              const formattedStartDate = !isNaN(startDate)
                ? startDate.toLocaleDateString() + ' ' + startDate.toLocaleTimeString()
                : 'Fecha inválida';

              const formattedEndDate = !isNaN(endDate)
                ? endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString()
                : 'Fecha inválida';

              return (
                <tr key={index}>
                  <td>{request.titulo || request.title || '—'}</td>
                  <td>{request.clienteNombre}</td>
                  <td>{`${formattedStartDate} – ${formattedEndDate}`}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onAccept(request)}
                    >
                      Aceptar
                    </Button>{' '}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onReject(request)}
                    >
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
