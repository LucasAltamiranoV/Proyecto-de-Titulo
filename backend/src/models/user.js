const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  imagenUrl: { type: String },
  descripcion: { type: String },
  correo: { type: String, required: true, unique: true, lowercase: true },
  clave: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  creadoEn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', userSchema);

