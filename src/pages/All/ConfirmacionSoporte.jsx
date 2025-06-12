import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PageStyles/ConfirmacionSoporte.css';
import { FaCheckCircle } from 'react-icons/fa';

function ConfirmacionReporte() {
  const navigate = useNavigate();

  return (
    <div className="confirmacion-wrapper">
      <div className="confirmacion-container">
        <FaCheckCircle className="icono-check" />
        <h2>¡Reporte enviado con éxito!</h2>
        <p>Gracias por tu mensaje. Nuestro equipo revisará tu reporte y te notificaremos pronto con una respuesta.</p>

        <button onClick={() => navigate('/home')} className="btn-volver">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default ConfirmacionReporte;
