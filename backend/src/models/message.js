const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  emisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receptor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenido: { type: String, required: true },
  enviadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
