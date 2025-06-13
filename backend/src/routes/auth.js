// src/routes/auth.js
const express = require('express');
const router = express.Router();

// Importar los controladores reales
const {
  register,
  confirmEmail,
  login,
  randomProfiles,
  searchProviders,
  createAdmin,
  getAllUsersAndProviders
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
//crear un administrador sin confirmación
router.post('/createAdmin', createAdmin);
//obtener todos los usuarios y proveedores
router.get('/getAllUserSistem', getAllUsersAndProviders);

// Ruta DEV: crea usuario o proveedor sin etapa de confirmación

module.exports = router;
