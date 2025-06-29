// src/routes/chat.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/chat/enviar
router.post('/enviar', async (req, res) => {
  const { emisorId, emisorModel, receptorId, receptorModel, contenido, tipo, providerId } = req.body;
  if (!emisorId || !emisorModel || !receptorId || !receptorModel || !contenido) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const mensaje = new Message({
      emisor: emisorId,
      emisorModel,
      receptor: receptorId,
      receptorModel,
      contenido,
      tipo: tipo || 'texto',       // Por defecto "texto" si no viene
      providerId: providerId || null
    });
    await mensaje.save();
    return res.status(201).json({ message: 'Mensaje enviado', mensaje });
  } catch (error) {
    console.error('Error al guardar mensaje:', error);
    return res.status(500).json({ error: 'Error interno al enviar el mensaje.' });
  }
});

// GET /api/chat/conversacion/:emisorId/:emisorModel/:receptorId/:receptorModel
router.get(
  '/conversacion/:emisorId/:emisorModel/:receptorId/:receptorModel',
  async (req, res) => {
    const { emisorId, emisorModel, receptorId, receptorModel } = req.params;
    if (!emisorId || !emisorModel || !receptorId || !receptorModel) {
      return res.status(400).json({ error: 'Faltan parámetros en la URL.' });
    }
    try {
      // Convertimos a ObjectId usando 'new'
      const emisorOID = new mongoose.Types.ObjectId(emisorId);
      const receptorOID = new mongoose.Types.ObjectId(receptorId);

      const mensajes = await Message.find({
        $or: [
          {
            emisor: emisorOID,
            emisorModel,
            receptor: receptorOID,
            receptorModel
          },
          {
            emisor: receptorOID,
            emisorModel: receptorModel,
            receptor: emisorOID,
            receptorModel: emisorModel
          }
        ]
      }).sort({ enviadoEn: 1 });

      return res.json(mensajes);
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      return res.status(500).json({ error: 'Error al obtener la conversación.' });
    }
  }
);

// GET /api/chat/ultimos/:userId/:userModel
router.get('/ultimos/:userId/:userModel', async (req, res) => {
  const { userId, userModel } = req.params;
  if (!userId || !userModel) {
    return res.status(400).json({ error: 'Faltan parámetros userId o userModel.' });
  }
  try {
    // Convertimos a ObjectId usando 'new'
    const userOID = new mongoose.Types.ObjectId(userId);

    const ultimos = await Message.aggregate([
      {
        $match: {
          $or: [
            { emisor: userOID, emisorModel: userModel },
            { receptor: userOID, receptorModel: userModel }
          ]
        }
      },
      { $sort: { enviadoEn: -1 } },
      {
        $group: {
          _id: {
            contactoId: {
              $cond: [
                { $eq: ['$emisor', userOID] },
                '$receptor',
                '$emisor'
              ]
            },
            contactoModel: {
              $cond: [
                { $eq: ['$emisor', userOID] },
                '$receptorModel',
                '$emisorModel'
              ]
            }
          },
          ultimoMensaje: { $first: '$contenido' },
          fecha: { $first: '$enviadoEn' },
          mensajeId: { $first: '$_id' }
        }
      },
      {
        $project: {
          _id: 0,
          contactoId: '$_id.contactoId',
          contactoModel: '$_id.contactoModel',
          ultimoMensaje: 1,
          fecha: 1,
          mensajeId: 1
        }
      }
    ]);

    return res.json(ultimos);
  } catch (error) {
    console.error('Error al obtener últimos mensajes:', error);
    return res.status(500).json({ error: 'Error al obtener los últimos mensajes.' });
  }
});

module.exports = router;
