// src/routes/auth.js
const express = require('express');
const router = express.Router();

// Importar los controladores reales
const {
  register,
  confirmEmail,
  login,
  randomProfiles,
  searchProviders
} = require('../controllers/authController');

// Registro “real” (envía email de confirmación)
router.post('/register', register);

// Confirmación de cuenta (email)
router.get('/confirm/:token', confirmEmail);

// Login (usuarios o proveedores)
router.post('/login', login);

// Obtener perfiles aleatorios de proveedores
router.get('/random-profiles', randomProfiles);

// Búsqueda de proveedores según query ?q=
router.get('/search', searchProviders);

// Ruta DEV: crea usuario o proveedor sin etapa de confirmación

module.exports = router;
