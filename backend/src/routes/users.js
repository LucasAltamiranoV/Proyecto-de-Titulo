const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Obtener todos los proveedores
router.get('/proveedores', async (req, res) => {
  try {
    const proveedores = await User.find({ rol: 'proveedor' }).select('-clave');
    res.json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-clave');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = router;
