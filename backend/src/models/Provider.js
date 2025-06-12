const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  clave: { type: String, required: true },
  imagenUrl: { type: String },
  servicios: { type: [String], required: true }, // arreglo con servicios (ej. ["Manicura", "Pedicura"])
  ciudad: { type: String },


    valoraciones: [{
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    calificacion: { type: Number, min: 0, max: 5 }
  }],

  
  descripcion: { type: String },
  galeria: { type: [String], default: [] }, // URLs de imágenes
  eventos: [{  // Este es el nuevo campo que añadimos
    titulo: { type: String, required: true },
    inicio: { type: Date, required: true },
    fin: { type: Date, required: true },
    todoElDia: { type: Boolean, default: false },
  }],
    eventRequests: [{  // Solicitudes de eventos pendientes
    titulo: { type: String, required: true },
    inicio: { type: Date, required: true },
    fin: { type: Date, required: true },
    todoElDia: { type: Boolean, default: false },
    clienteNombre: String,
    clienteId: String,
    status: { type: String, enum: ['pendiente', 'aceptado', 'rechazado'], default: 'pendiente' }
  }]
}, {
  timestamps: true
});

// Exportamos el modelo 'Provider'
module.exports = mongoose.model(
  'Provider',
  proveedorSchema,
  'proveedors'
);
