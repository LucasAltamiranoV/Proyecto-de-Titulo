import React, { useState, useEffect } from 'react';  // Importa useState y useEffect
import { Card, Button, Form } from 'react-bootstrap';  // Importa los componentes de Bootstrap
import PropTypes from 'prop-types';
import '../styles/PageStyles/ProfileCard.css';

export default function ProfileCard({
  data,
  onImageChange,
  onSaveDescription,
  imageField,  // Propiedad para el campo de la imagen
  nameField,   // Propiedad para el campo del nombre
  emailField,  // Propiedad para el campo del correo
  descriptionField, // Propiedad para el campo de descripción
  children
}) {
  const [remoteUrl, setRemoteUrl] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [description, setDescription] = useState('');

  const API_URL = 'http://localhost:4000';

  // Actualiza la URL remota cuando cambie data[imageField]
  useEffect(() => {
    if (data?.[imageField]) {
      // Construir la URL completa de la imagen
      setRemoteUrl(`${API_URL}${data[imageField]}`);
    } else {
      setRemoteUrl(null);
    }
  }, [data, imageField]);

  // Actualiza la descripción cuando cambie
  useEffect(() => {
    setDescription(data?.[descriptionField] || '');
  }, [data, descriptionField]);

  // Manejo del cambio de imagen
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));  // Previsualiza la imagen localmente
    onImageChange && onImageChange(file);  // Llama a la función proporcionada para subir la imagen
  };

  // Manejo de la actualización de descripción
  const handleSaveDesc = () => {
    onSaveDescription && onSaveDescription(description);
  };

  // Elige primero la previsualización local, luego la remota
  const preview = localPreview || remoteUrl;

  return (
    <Card className="profile-card mb-4">
      <div className="profile-header">
        <h5>{data?.[nameField] || '—'}</h5>
      </div>

      <div className="profile-img-container">
        {preview ? (
          <img
            src={preview}
            alt="Perfil"
            className="profile-img"
            onError={() => setLocalPreview(null)} // Elimina la previsualización si la carga de la imagen falla
          />
        ) : (
          <div className="profile-img-placeholder">Sin imagen</div>
        )}
      </div>

      <Card.Body className="profile-info">
        <div className="name">{data?.[nameField]}</div>
        <p>{data?.[emailField]}</p>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          {onSaveDescription && (
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={handleSaveDesc}
            >
              Guardar descripción
            </Button>
          )}
        </Form.Group>

        {children}
      </Card.Body>

      <Card.Body>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Cambiar imagen de perfil</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}

// PropTypes para validaciones
ProfileCard.propTypes = {
  data: PropTypes.object.isRequired,
  onImageChange: PropTypes.func,    // Función para manejar la subida de imagen
  onSaveDescription: PropTypes.func,  // Función para manejar la descripción
  imageField: PropTypes.string.isRequired,  // Propiedad para la imagen
  nameField: PropTypes.string.isRequired,   // Propiedad para el nombre
  emailField: PropTypes.string.isRequired,  // Propiedad para el correo
  descriptionField: PropTypes.string.isRequired, // Propiedad para la descripción
  children: PropTypes.node
};
