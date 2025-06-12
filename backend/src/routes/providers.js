// src/routes/providers.js

const express = require('express');
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const Provider = require('../models/Provider');
const router = express.Router();

// ------------------------------------------------------------------
// Configuración de subida de archivos (imágenes de perfil) se complementa con endpoint 5
// ------------------------------------------------------------------
// Carpeta uploads compartida con usuarios
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// ------------------------------------------------------------------
// Función inline de autenticación
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 1) GET /api/providers/perfil
//    Perfil del proveedor autenticado
// ------------------------------------------------------------------
router.get(
  '/perfil/:id',
  authenticate,
  async (req, res) => {
    try {
      const proveedor = await Provider
        .findById(req.user.id)
        .select('-clave');
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      res.json(proveedor);
    } catch (error) {
      console.error('Error al obtener mi perfil:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
);

// ------------------------------------------------------------------
// 2) GET /api/providers
//    Lista todos los proveedores (público)
// ------------------------------------------------------------------
router.get(
  '/',
  async (req, res) => {
    try {
      const proveedores = await Provider.find().select('-clave');
      res.json(proveedores);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      res.status(500).json({ error: 'Error al obtener proveedores' });
    }
  }
);

// ------------------------------------------------------------------
// 3) GET /api/providers/detalle/:id
//    Detalle público de un proveedor por su ID
// ------------------------------------------------------------------
router.get(
  '/detalle/:id',
  async (req, res) => {
    try {
      const proveedor = await Provider.findById(req.params.id).select('-clave');
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      res.json(proveedor);
    } catch (error) {
      console.error('Error al obtener el proveedor:', error);
      res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
  }
);

// ------------------------------------------------------------------
// 4) PUT /api/providers/detalle/:id
//    Actualiza la descripción de un proveedor
// ------------------------------------------------------------------
// Actualizar descripción del proveedor autenticado
router.put('/descripcion', authenticate, async (req, res) => {
  try {
    const { descripcion } = req.body;
    const updated = await Provider.findByIdAndUpdate(
      req.user.id,
      { descripcion },
      { new: true, select: '-clave' }
    );
    if (!updated) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar descripción:', err);
    res.status(500).json({ error: 'Error al actualizar descripción' });
  }
});
//----------------------------------------------------------
// 5) POST /api/providers/upload-profile-image/:id

// ------------------------------------------------------------------
// Subir imagen de perfil del proveedor autenticado
router.post('/:id/avatar', authenticate, upload.single('imagen'), async (req, res) => {
  try {
        if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    provider.imagenUrl = `/uploads/${req.file.filename}`;
    await provider.save();
    res.json({ imagenUrl: provider.imagenUrl });
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});
// ------------------------------------------------------------------
// POST /api/providers/:id/gallery
//    Sube una imagen a la galería del proveedor
// ------------------------------------------------------------------
router.post('/:id/gallery', authenticate, upload.single('imagen'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    provider.galeria.push(`/uploads/${req.file.filename}`);
    await provider.save();
    res.json({ galeria: provider.galeria });
  } catch (err) {
    console.error('Error al subir foto de galería:', err);
    res.status(500).json({ error: 'Error al subir foto de galería' });
  }
});

// ------------------------------------------------------------------
// 6) POST /api/providers/:id/eventos
//    Agrega un evento al proveedor
// ------------------------------------------------------------------
router.post('/:id/eventos', authenticate, async (req, res) => {
  try {
    // Verificar si el proveedor existe
    const proveedor = await Provider.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Verificar que el proveedor sea el mismo que está haciendo la solicitud
    if (req.user.id !== proveedor.id) {
      return res.status(403).json({ error: 'No autorizado a modificar este proveedor' });
    }

    // Crear el nuevo evento a partir de los datos enviados en el cuerpo de la solicitud
    const { titulo, inicio, fin, todoElDia } = req.body;

    // Validar la entrada de datos
    if (!titulo || !inicio || !fin) {
      return res.status(400).json({ error: 'Faltan datos necesarios para crear el evento' });
    }

    // Crear el evento y agregarlo al proveedor
    const nuevoEvento = {
      titulo,
      inicio: new Date(inicio),
      fin: new Date(fin),
      todoElDia: todoElDia || false,
    };

    proveedor.eventos.push(nuevoEvento); // Agregar el evento al arreglo de eventos del proveedor

    // Guardar el proveedor con el nuevo evento
    await proveedor.save();

    res.status(200).json({ success: 'Evento agregado con éxito', eventos: proveedor.eventos });
  } catch (error) {
    console.error('Error al agregar el evento:', error);
    res.status(500).json({ error: 'Error al agregar el evento' });
  }
});
// En tu archivo de rutas (por ejemplo, `providers.js` en el backend)
router.get('/:id/events', authenticate, async (req, res) => {
  try {
    const proveedor = await Provider.findById(req.params.id); // Busca al proveedor por ID
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json(proveedor.eventos); // Devuelve los eventos del proveedor
  } catch (err) {
    console.error('Error al obtener eventos:', err);
    res.status(500).json({ error: 'Error al obtener eventos del proveedor' });
  }
});


module.exports = router;