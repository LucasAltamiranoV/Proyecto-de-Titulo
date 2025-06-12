// src/routes/users.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const User    = require('../models/user');
const jwt     = require('jsonwebtoken');

const router = express.Router();

// 1) Carpeta de uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 2) Multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:  (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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

// 3) GET /api/users/perfil/:id
//    Para asemejarlo a tu ruta de provider
router.get('/perfil/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-clave');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    usuario.imagenUrl = usuario.imagenUrl || 'https://via.placeholder.com/150';
    return res.json(usuario);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// 4) POST /api/users/upload-profile-image/:id
//    Coincide con lo que usas en el frontend
router.post('/upload-profile-image/:id', authenticate, upload.single('imagen'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    usuario.imagenUrl = `/uploads/${req.file.filename}`;
    await usuario.save();
    return res.json({ message: 'Imagen actualizada', imagenUrl: usuario.imagenUrl });
  } catch (err) {
    console.error('Error al subir imagen:', err);
    return res.status(500).json({ error: 'Error al subir imagen' });
  }
});

router.put('/descripcion/:id', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { descripcion } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { descripcion },
      { new: true, select: '-clave' }
    );
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar descripción:', err);
    res.status(500).json({ error: 'Error al actualizar descripción' });
  }
});

module.exports = router;
