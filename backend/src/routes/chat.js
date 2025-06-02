const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Enviar mensaje
router.post('/enviar', async (req, res) => {
  const { emisor, receptor, contenido } = req.body;

  if (!emisor || !receptor || !contenido) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const mensaje = new Message({ emisor, receptor, contenido });
    await mensaje.save();
    res.status(201).json({ message: 'Mensaje enviado', mensaje });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

// Obtener historial entre dos usuarios
router.get('/historial', async (req, res) => {
  const { usuario1, usuario2 } = req.query;

  try {
    const mensajes = await Message.find({
      $or: [
        { emisor: usuario1, receptor: usuario2 },
        { emisor: usuario2, receptor: usuario1 }
      ]
    }).sort({ enviadoEn: 1 });

    res.json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// NUEVA RUTA: Últimos mensajes por contacto
router.get('/ultimos/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const mensajes = await Message.aggregate([
      {
        $match: {
          $or: [
            { emisor: userId },
            { receptor: userId }
          ]
        }
      },
      { $sort: { enviadoEn: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$emisor', userId] },
              '$receptor',
              '$emisor'
            ]
          },
          ultimoMensaje: { $first: '$contenido' },
          enviadoEn: { $first: '$enviadoEn' }
        }
      }
    ]);

    res.json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener últimos mensajes' });
  }
});

module.exports = router;
