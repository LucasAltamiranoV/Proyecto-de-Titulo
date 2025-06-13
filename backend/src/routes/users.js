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

//AUTENTICACION DEL USUARIO
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
//    Para asemejarlo a  ruta de provider
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

//actualizar la descripción del usuario
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
//////////////////////////////////////////////////////////
//ENDPOINTS DE ADMIN
/////////////////////////////////////////////////////////

// Crear un nuevo usuario
router.post('/create', authenticate, async (req, res) => {
  try {
    const { nombre, correo, clave, role } = req.body;

    // Log para revisar los datos recibidos
    console.log('Crear usuario con datos:', req.body);

    if (!nombre || !correo || !clave || !role) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const nuevoUsuario = new User({ nombre, correo, clave, role });
    await nuevoUsuario.save();

    console.log('Usuario creado:', nuevoUsuario);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(400).json({ error: error.message });
  }
});

// Editar un usuario
router.put('/:id/editar', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, role } = req.body;

    console.log('Editar usuario con datos:', req.body);

    if (!nombre || !correo || !role) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const usuario = await User.findByIdAndUpdate(id, { nombre, correo, role }, { new: true });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario actualizado:', usuario);
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un usuario
router.delete('/:id/eliminar', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Eliminar usuario con ID:', id);

    const usuario = await User.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario eliminado:', usuario);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
