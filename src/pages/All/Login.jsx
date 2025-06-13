import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TituloCrearInicio from '../../components/TituloCrearInicio';
import { LabeledInput } from '../../components/formularios/LabelGenerico';
import logo from '../../assets/logo.png';
import { Modal, Button } from 'react-bootstrap';             // <-- importar Modal
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = ({ onLogin, error }) => {
  const [correo, setCorreo]     = useState('');
  const [clave, setClave]       = useState('');
  const [localError, setLocalError] = useState('');
  const [showError, setShowError]   = useState(false);

  // Cuando cambie error (del backend), mostramos el modal
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!correo.trim() || !clave.trim()) {
      setLocalError('Por favor ingresa correo y clave para continuar.');
      return;
    }
    setLocalError('');
    onLogin({ correo, clave });
  };

  return (
    <div className="container py-5">
      {/* Modal de error */}
      <Modal show={showError} onHide={() => setShowError(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error al iniciar sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowError(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mensaje de validación local */}
      {localError && (
        <div className="alert alert-danger text-center">
          {localError}
        </div>
      )}

      <div className="row align-items-center">
        <div className="col-md-5 d-flex justify-content-center mb-4 mb-md-0">
          <img src={logo} alt="Logo" className="img-fluid" style={{ maxWidth: '300px' }} />
        </div>
        <div className="col-md-7">
          <TituloCrearInicio texto="Iniciar sesión" height="140px" fontSize="clamp(1.5rem, 5vw, 2.5rem)" />

          <p className="text-center mt-2 text-muted">¿Ya tienes cuenta? Accede</p>

          <form onSubmit={handleSubmit} className="mx-auto mt-3" style={{ maxWidth: '450px' }} noValidate>
            <div className="mb-3">
              <LabeledInput
                label="Correo electrónico"
                name="correo"
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="hola@sitioincreible.com"
                required
              />
            </div>
            <div className="mb-3">
              <LabeledInput
                label="Clave"
                name="clave"
                type="password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="d-grid mb-4">
              <button type="submit" className="btn btn-dark btn-lg">
                Iniciar sesión
              </button>
            </div>
          </form>

          <p className="text-center">
            O regístrate <Link to="/registeruser">aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
