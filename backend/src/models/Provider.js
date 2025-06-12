const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  clave: { type: String, required: true },
  imagenUrl: { type: String },
  servicios: { type: [String], required: true }, // arreglo con servicios (ej. ["Manicura", "Pedicura"])
  ciudad: { type: String },
  calificacion: { type: Number, min: 0, max: 5, default: 0 },
  descripcion: { type: String },
  galeria: { type: [String], default: [] }, // URLs de imágenes
  disponibilidad: {
    domingo: { type: [String], default: [] },
    lunes: { type: [String], default: [] },
    martes: { type: [String], default: [] },
    miercoles: { type: [String], default: [] },
    jueves: { type: [String], default: [] },
    viernes: { type: [String], default: [] },
    sabado: { type: [String], default: [] },
  },
}, {
  timestamps: true
});

// Exportamos el modelo 'Provider'
module.exports = mongoose.model(
  'Provider',
  proveedorSchema,
  'proveedors'
);
