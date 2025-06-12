const express = require('express');
const jwt = require('jsonwebtoken');
const Provider = require('../models/Provider');
const Reservation = require('../models/Reservation');
const router = express.Router();

// Middleware de autenticación
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

// Definir los días de la semana
const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

// Ruta para crear una reserva
router.post('/', authenticate, async (req, res) => {
  const { providerId, date, startTime, endTime } = req.body;
  console.log('Datos recibidos para la creación de reserva:', req.body);

  if (!providerId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });

    const day = days[new Date(date).getDay()]; // Verificación de día

    // Verificar si el horario está disponible en base a startTime y endTime
    const isAvailable = provider.disponibilidad[day]?.some(
      (availableSlot) => {
        const [availableStart, availableEnd] = availableSlot.split('-');
        return new Date(`1970-01-01T${availableStart}:00`) <= new Date(startTime) &&
               new Date(`1970-01-01T${availableEnd}:00`) >= new Date(endTime);
      }
    );

    if (!isAvailable) {
      return res.status(400).json({ error: 'Horario no disponible' });
    }

    // Crear la reserva
    const reservation = new Reservation({
      provider: providerId,
      user: req.user.id,
      date,
      startTime,
      endTime,
      status: 'pending'
    });
    console.log('Provider:', provider);
    console.log('Day:', day);

    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    console.error('Error al crear reserva:', err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Ruta para actualizar el estado de la reserva (aceptar/rechazar)
router.put('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body; // accepted o rejected
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const reserv = await Reservation.findById(req.params.id);
    if (!reserv) return res.status(404).json({ error: 'Reserva no encontrada' });

    if (reserv.status !== 'pending') {
      return res.status(400).json({ error: 'La reserva ya fue procesada' });
    }

    // Solo el proveedor dueño puede aceptar/rechazar
    if (reserv.provider.toString() !== req.user.id && req.user.accountType !== 'provider') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const provider = await Provider.findById(reserv.provider);
    const day = days[new Date(reserv.date).getDay()]; // Obtener el día de la semana

    if (status === 'accepted') {
      // Verificar que el horario esté disponible si es un proveedor
      const isAvailable = provider.disponibilidad[day]?.some(
        (availableSlot) => {
          const [availableStart, availableEnd] = availableSlot.split('-');
          return new Date(`1970-01-01T${availableStart}:00`) <= new Date(reserv.startTime) &&
                 new Date(`1970-01-01T${availableEnd}:00`) >= new Date(reserv.endTime);
        }
      );

      if (!isAvailable) {
        return res.status(400).json({ error: 'Horario ya no disponible' });
      }

      // Si está aceptada, se elimina la disponibilidad del horario
      provider.disponibilidad[day] = provider.disponibilidad[day].filter(
        (slot) => !(new Date(`1970-01-01T${slot.split('-')[0]}:00`) <= new Date(reserv.startTime) &&
                    new Date(`1970-01-01T${slot.split('-')[1]}:00`) >= new Date(reserv.endTime))
      );
      await provider.save();
    }

    // Actualizamos el estado de la reserva
    reserv.status = status;
    await reserv.save();
    res.json(reserv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// Ruta para obtener las reservas de un proveedor
router.get('/:providerId/reservations', authenticate, async (req, res) => {
  try {
    const reservations = await Reservation.find({ provider: req.params.providerId })
      .populate('user', 'nombre correo')  // Obtener detalles del usuario
      .sort({ date: 1, startTime: 1 });  // Ordenar por fecha y hora de inicio
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
});

module.exports = router;
