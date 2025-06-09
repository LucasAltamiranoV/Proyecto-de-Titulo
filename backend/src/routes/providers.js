// src/routes/providers.js

const express = require('express');
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const Provider = require('../models/Provider');
const Reservation = require('../models/Reservation');
const router = express.Router();

// ------------------------------------------------------------------
// Configuración de subida de archivos (imágenes de perfil)
// ------------------------------------------------------------------
// Carpeta uploads compartida con usuarios
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// ------------------------------------------------------------------
// Función inline de autenticación
// ------------------------------------------------------------------
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: falta token' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, accountType: payload.accountType };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ------------------------------------------------------------------
// 1) GET /api/providers/perfil
//    Perfil del proveedor autenticado
// ------------------------------------------------------------------
router.get(
  '/perfil',
  authenticate,
  async (req, res) => {
    try {
      const proveedor = await Provider
        .findById(req.user.id)
        .select('-clave');
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      res.json(proveedor);
    } catch (error) {
      console.error('Error al obtener mi perfil:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
);

// ------------------------------------------------------------------
// 2) GET /api/providers
//    Lista todos los proveedores (público)
// ------------------------------------------------------------------
router.get(
  '/',
  async (req, res) => {
    try {
      const proveedores = await Provider.find().select('-clave');
      res.json(proveedores);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      res.status(500).json({ error: 'Error al obtener proveedores' });
    }
  }
);

// ------------------------------------------------------------------
// 3) GET /api/providers/detalle/:id
//    Detalle público de un proveedor por su ID
// ------------------------------------------------------------------
router.get(
  '/detalle/:id',
  async (req, res) => {
    try {
      const proveedor = await Provider.findById(req.params.id).select('-clave');
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      res.json(proveedor);
    } catch (error) {
      console.error('Error al obtener el proveedor:', error);
      res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
  }
);
// ------------------------------------------------------------------
// GET /api/providers/:id/reservations
//    Lista todas las reservas de ese proveedor
// ------------------------------------------------------------------
router.get('/:id/reservations', async (req, res) => {
  try {
    const reservas = await Reservation.find({ provider: req.params.id });
    res.json(reservas);
  } catch (err) {
    console.error('Error al obtener reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// ------------------------------------------------------------------
// 4) PUT /api/providers/detalle/:id
//    Actualiza la descripción de un proveedor
// ------------------------------------------------------------------
// Actualizar descripción del proveedor autenticado
router.put('/descripcion', authenticate, async (req, res) => {
  try {
    const { descripcion } = req.body;
    const updated = await Provider.findByIdAndUpdate(
      req.user.id,
      { descripcion },
      { new: true, select: '-clave' }
    );
    if (!updated) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar descripción:', err);
    res.status(500).json({ error: 'Error al actualizar descripción' });
  }
});
//----------------------------------------------------------
// 5) POST /api/providers/upload-profile-image/:id

// ------------------------------------------------------------------
// Subir imagen de perfil del proveedor autenticado
router.post('/:id/avatar', authenticate, upload.single('imagen'), async (req, res) => {
  try {
        if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    provider.imagenUrl = `/uploads/${req.file.filename}`;
    await provider.save();
    res.json({ imagenUrl: provider.imagenUrl });
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});
// 5) PUT /api/providers/disponibilidad
//    Actualiza la disponibilidad horaria del proveedor autenticado
// ------------------------------------------------------------------
// Actualizar disponibilidad del proveedor autenticado
router.put('/availability', authenticate, async (req, res) => {
  try {
    const { disponibilidad } = req.body; // objeto con dias -> array de horas
    const updated = await Provider.findByIdAndUpdate(
      req.user.id,
      { disponibilidad },
      { new: true, select: '-clave' }
    );
    if (!updated) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar disponibilidad:', err);
    res.status(500).json({ error: 'Error al actualizar disponibilidad' });
  }
});


module.exports = router;