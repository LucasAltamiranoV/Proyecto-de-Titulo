import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/PageStyles/FormularioReporteUsuario.css';

function FormularioReporteUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nombre = params.get('nombre');
    if (nombre) setUsuario(nombre);
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ usuario, motivo, descripcion });

    // enviamos el reporte al correo
    navigate('/reporte-enviado');
  };

  return (
    <div className="reporte-usuario-container">
      <h2>Reportar Usuario</h2>
      <p>Estás reportando a: <strong>{usuario}</strong></p>

      <form onSubmit={handleSubmit} className="reporte-usuario-form">
        <label>Motivo del reporte</label>
        <select
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
        >
          <option value="">-- Selecciona un motivo --</option>
          <option value="lenguaje inapropiado">Lenguaje inapropiado</option>
          <option value="comportamiento ofensivo">Comportamiento ofensivo</option>
          <option value="spam o estafa">Spam o estafa</option>
          <option value="otro">Otro</option>
        </select>

        <label>Descripción</label>
        <textarea
          rows="5"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe con detalle el problema..."
          required
        />

        <button type="submit">Enviar reporte</button>
      </form>
    </div>
  );
}

export default FormularioReporteUsuario;
