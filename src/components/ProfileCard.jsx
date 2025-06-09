import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import '../styles/PageStyles/ProfileCard.css';

export default function ProfileCard({
  data,
  nameField = 'nombre',
  emailField = 'correo',
  imageField = 'imagenUrl',
  descriptionField = 'descripcion',
  onImageChange,
  onSaveDescription,         // callback opcional para guardar la descripción
  children                   // sección extra (services, availability, etc.)
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const imgUrl = data?.[imageField];
    setImagePreview(imgUrl || null);

    setDescription(data?.[descriptionField] || '');
  }, [data, imageField, descriptionField]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    onImageChange && onImageChange(file);
  };

  const handleSaveDesc = () => {
    onSaveDescription && onSaveDescription(description);
  };

  return (
    <Card className="profile-card mb-4">
      <div className="profile-header">
        <h5>{data?.[nameField] || '—'}</h5>
      </div>

      <div className="profile-img-container">
            {imagePreview && (
          <img
            src={imagePreview || undefined}
            alt="Perfil"
            className="profile-img"
            onError={() => setImagePreview(null)}
          />
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
            <Button variant="primary" size="sm" className="mt-2" onClick={handleSaveDesc}>
              Guardar descripción
            </Button>
          )}
        </Form.Group>

        {children}
      </Card.Body>

      <Card.Body>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Cambiar imagen de perfil</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
