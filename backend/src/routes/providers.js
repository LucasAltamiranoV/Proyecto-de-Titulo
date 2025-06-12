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
// Configuración de subida de archivos (imágenes de perfil) se complementa con endpoint 5
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
  '/perfil/:id',
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
// Endpoint para obtener las reservas de un proveedor
// ------------------------------------------------------------------
router.get('/:id/reservations', async (req, res) => {
  try {
    const filter = { provider: req.params.id };  // Filtra por ID de proveedor
    if (req.query.status) filter.status = req.query.status; // Filtrar por estado (aceptada, pendiente, rechazada)
    
    // Filtrar por fecha si se recibe un rango de fechas en los parámetros de la consulta
    if (req.query.startDate && req.query.endDate) {
      filter.startTime = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const reservas = await Reservation.find(filter)
      .populate('user', 'nombre correo')  // Opcional: para obtener datos del usuario que hizo la reserva
      .sort({ startTime: 1 });  // Ordenar por `startTime` (hora de inicio)

    res.json(reservas);
  } catch (err) {
    console.error('Error al obtener reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// ------------------------------------------------------------------
// Nuevo endpoint: PUT /api/providers/reservations/:id/status
// Actualiza el estado de una reserva (aceptar/rechazar)
// ------------------------------------------------------------------
router.put('/reservations/:id/status', authenticate, async (req, res) => {
  const { status } = req.body; // 'accepted' o 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });

    // Solo el proveedor dueño de la reserva puede actualizar el estado
    if (reservation.provider.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Verificar si el estado es 'accepted' y que el horario esté disponible
    if (status === 'accepted') {
      const provider = await Provider.findById(reservation.provider);
      const day = days[new Date(reservation.startTime).getDay()]; // Usamos startTime para obtener el día

      // Verificar si el horario aún está disponible (comparar las horas con la disponibilidad del proveedor)
      const isTimeAvailable = provider.disponibilidad[day]?.some(
        (availableSlot) => {
          // Comparamos si el evento se cruza con la disponibilidad del proveedor
          const [availableStart, availableEnd] = availableSlot.split('-');
          const timeStart = new Date(`${reservation.date}T${availableStart}:00`);
          const timeEnd = new Date(`${reservation.date}T${availableEnd}:00`);

          // Verificamos que el evento no se cruce con la disponibilidad
          return reservation.startTime >= timeStart && reservation.endTime <= timeEnd;
        }
      );

      if (!isTimeAvailable) {
        return res.status(400).json({ error: 'Horario ya no disponible' });
      }

      // Eliminar la disponibilidad del proveedor para ese horario
      provider.disponibilidad[day] = provider.disponibilidad[day].filter(
        (availableSlot) => {
          const [availableStart, availableEnd] = availableSlot.split('-');
          const timeStart = new Date(`${reservation.date}T${availableStart}:00`);
          const timeEnd = new Date(`${reservation.date}T${availableEnd}:00`);
          return !(reservation.startTime >= timeStart && reservation.endTime <= timeEnd);
        }
      );
      await provider.save();
    }

    // Actualizar el estado de la reserva
    reservation.status = status;
    await reservation.save();

    res.status(200).json(reservation); // Responder con la reserva actualizada
  } catch (err) {
    console.error('Error al actualizar estado de la reserva:', err);
    res.status(500).json({ error: 'Error al actualizar estado de la reserva' });
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
// ------------------------------------------------------------------
// POST /api/providers/:id/gallery
//    Sube una imagen a la galería del proveedor
// ------------------------------------------------------------------
router.post('/:id/gallery', authenticate, upload.single('imagen'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    provider.galeria.push(`/uploads/${req.file.filename}`);
    await provider.save();
    res.json({ galeria: provider.galeria });
  } catch (err) {
    console.error('Error al subir foto de galería:', err);
    res.status(500).json({ error: 'Error al subir foto de galería' });
  }
});

// ------------------------------------------------------------------
// POST /api/providers/:id/rate
//    Califica al proveedor
// ------------------------------------------------------------------
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Calificación inválida' });
    }
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    provider.calificacion = rating;
    await provider.save();
    res.json({ calificacion: provider.calificacion });
  } catch (err) {
    console.error('Error al calificar proveedor:', err);
    res.status(500).json({ error: 'Error al calificar proveedor' });
  }
});


module.exports = router;