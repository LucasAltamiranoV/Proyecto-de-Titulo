const express = require('express');
const jwt = require('jsonwebtoken');
const Provider = require('../models/Provider');
const Reservation = require('../models/Reservation');
const router = express.Router();

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

const days = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

router.post('/', authenticate, async (req, res) => {
  const { providerId, date, timeSlot } = req.body;
  if (!providerId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    const day = days[new Date(date).getDay()];
     if (!provider.disponibilidad[day]?.includes(timeSlot)) {
      return res.status(400).json({ error: 'Horario no disponible' });
    }
    const endTime = startTime;
    const reservation = new Reservation({
      provider: providerId,
      user: req.user.id,
      date,
      timeSlot,
      status: 'pending'
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body; // accepted o rejected
  if (!['accepted','rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    const reserv = await Reservation.findById(req.params.id);
    if (!reserv) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reserv.status !== 'pending') {
      return res.status(400).json({ error: 'La reserva ya fue procesada' });
    }
    // Solo el proveedor dueño puede aceptar/rechazar
    if (reserv.provider.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const provider = await Provider.findById(reserv.provider);
    const day = days[new Date(reserv.date).getDay()];
    if (status === 'accepted') {
      if (!provider.disponibilidad[day]?.includes(reserv.timeSlot)) {
        return res.status(400).json({ error: 'Horario ya no disponible' });
      }
      provider.disponibilidad[day] = provider.disponibilidad[day].filter(h => h !== reserv.startTime);
      await provider.save();
      // TODO: Integrar con Google Calendar
    }
    reserv.status = status;
    await reserv.save();
    res.json(reserv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

module.exports = router;