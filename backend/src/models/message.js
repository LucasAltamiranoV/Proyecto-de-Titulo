// src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'emisorModel'
  },
  emisorModel: {
    type: String,
    required: true,
    enum: ['User', 'Provider']
  },
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receptorModel'
  },
  receptorModel: {
    type: String,
    required: true,
    enum: ['User', 'Provider']
  },
  contenido: { type: String, required: true },
  tipo: { type: String, enum: ['texto', 'calificacion'], default: 'texto' },  // ← Nuevo campo
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },  
  enviadoEn: { type: Date, default: Date.now }
});

// Índice para acelerar consultas de conversación
messageSchema.index({
  emisor: 1,
  emisorModel: 1,
  receptor: 1,
  receptorModel: 1,
  enviadoEn: 1
});

// 🔴Este es el paso clave: exportar el modelo
module.exports = mongoose.model('Message', messageSchema);
