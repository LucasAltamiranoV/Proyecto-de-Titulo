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
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {eventRequests.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">No hay solicitudes pendientes</td>
            </tr>
          ) : (
            eventRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.clienteNombre}</td>
                <td>{new Date(request.fecha).toLocaleString()}</td>
                <td>
                  <Button variant="success" onClick={() => onAccept(request)}>
                    Aceptar
                  </Button>
                  <Button variant="danger" className="ms-2" onClick={() => onReject(request)}>
                    Rechazar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default EventRequestTable;
