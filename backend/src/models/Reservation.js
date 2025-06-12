const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Provider', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Si tienes un modelo de usuario, usa esto
    required: true 
  },
  date: { 
    type: Date,  // Usamos Date para permitir comparaciones de fecha
    required: true, 
  },      
  startTime: { 
    type: Date,  // Hora de inicio de la reserva
    required: true,
  },
  endTime: { 
    type: Date,  // Hora de fin de la reserva
    required: true,
  },
  status: {  // Estado de la reserva: pendiente, aceptada, rechazada, etc.
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
