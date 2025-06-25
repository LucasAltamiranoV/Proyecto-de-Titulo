// src/routes/providers.js

const mongoose = require('mongoose');
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
// 4) PUT /api/providers/:id
//    Actualiza la descripción de un proveedor
// ------------------------------------------------------------------
// Actualizar descripción del proveedor autenticado
router.put('/:id/descripcion', authenticate, async (req, res) => {
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

    // La URL completa de la imagen
    const imagenUrl = `/uploads/${req.file.filename}`;
    provider.imagenUrl = imagenUrl;

    // Guardamos la URL en la base de datos
    await provider.save();
    res.json({ imagenUrl: imagenUrl });  // Devolver la URL completa
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

// ------------------------------------------------------------------
// POST /api/providers/:id/gallery
//    Sube una imagen a la galería del proveedor
// ------------------------------------------------------------------
router.post(
  '/:id/gallery',
  authenticate,
  upload.single('imagen'),
  async (req, res) => {
    try {
      // Sólo el propio proveedor puede añadir a su galería
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const provider = await Provider.findById(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }

      // Guardamos la ruta en el array galeria
      const url = `/uploads/${req.file.filename}`;
      provider.galeria.push(url);
      await provider.save();

      return res.json({ galeria: provider.galeria });
    } catch (err) {
      console.error('Error al subir foto de galería:', err);
      return res.status(500).json({ error: 'Error al subir foto de galería' });
    }
  }
);

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
        inicio: new Date(inicio).toISOString(),  // Asegúrate de que la fecha esté en UTC
        fin: new Date(fin).toISOString(),        // Asegúrate de que la fecha esté en UTC
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

// obtenemos los eventos de un proveedor por su ID
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

// Endpoint para aceptar una solicitud de evento
// Endpoint para aceptar una solicitud de evento
router.post('/:id/events/accept', authenticate, async (req, res) => {
  try {
    const { requestId } = req.body;  // Este es el `requestId` que recibes del frontend

    const proveedor = await Provider.findById(req.user.id); // Obtener al proveedor autenticado

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Usar el _id de MongoDB (requestId debería ser el _id de la solicitud de evento)
    const requestIndex = proveedor.eventRequests.findIndex((request) => request._id.toString() === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Solicitud de evento no encontrada' });
    }

    // Mover la solicitud aceptada a la lista de eventos
    proveedor.eventRequests.splice(requestIndex, 1)[0];  // Elimina la solicitud de la lista de solicitudes
    
    await proveedor.save();  // Guardar los cambios en el proveedor

    res.json({ success: 'Evento aceptado', eventos: proveedor.eventos });
  } catch (error) {
    console.error('Error al aceptar la solicitud de evento:', error);
    res.status(500).json({ error: 'Error al aceptar la solicitud de evento' });
  }
});


//rechazar evento
router.post('/:id/events/reject', authenticate, async (req, res) => {
  try {
    const { requestId } = req.body;  // ID de la solicitud de evento
    const proveedor = await Provider.findById(req.user.id); // Obtener al proveedor autenticado

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Encontrar la solicitud de evento
    const requestIndex = proveedor.eventRequests.findIndex((request) => request.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Solicitud de evento no encontrada' });
    }

    // Eliminar la solicitud de la lista de solicitudes del proveedor
    proveedor.eventRequests.splice(requestIndex, 1);

    await proveedor.save();  // Guardar los cambios en el proveedor

    res.json({ success: 'Solicitud rechazada', eventRequests: proveedor.eventRequests });
  } catch (error) {
    console.error('Error al rechazar la solicitud de evento:', error);
    res.status(500).json({ error: 'Error al rechazar la solicitud de evento' });
  }
});

// Endpoint para obtener las solicitudes de eventos de un proveedor
router.get('/:id/eventos/solicitudes', authenticate, async (req, res) => {
  try {
    const proveedor = await Provider.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado :(' });
    }

    // Obtener todas las solicitudes de eventos pendientes
    const eventRequests = proveedor.eventRequests;
    res.json(eventRequests);
  } catch (error) {
    console.error('Error al obtener las solicitudes de eventos', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes de eventos' });
  }
});

// Endpoint para crear una solicitud de evento
router.post('/eventos/solicitar', async (req, res) => {
  try {
    const { titulo, proveedorId, clienteId, clienteNombre, inicio, fin, todoElDia } = req.body;

    
    console.log('Datos recibidos:', {
      titulo,
      proveedorId,
      clienteId,
      clienteNombre,
      inicio,
      fin,
      todoElDia
    });
  

    // Buscar al proveedor en la base de datos
    const proveedor = await Provider.findById(proveedorId);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado :/' });
    }

    // Crear la solicitud de evento
    const eventRequest = {
      titulo,
      clienteId,
      clienteNombre,
      inicio: new Date(inicio), // Convierte la fecha de inicio a tipo Date
      fin: new Date(fin),       // Convierte la fecha de fin a tipo Date
      todoElDia: todoElDia || false,
      status: 'pendiente',  // Inicialmente está pendiente
    };

    // Agregar la solicitud de evento en la lista de solicitudes del proveedor
    proveedor.eventRequests.push(eventRequest);
    await proveedor.save();

    res.json({ success: 'Solicitud de evento realizada con éxito', eventRequest });
  } catch (error) {
    console.error('Error al solicitar evento', error);
    res.status(500).json({ error: 'Error al solicitar evento', details: error.message });
  }
});
// Endpoint para agregar una valoración a un proveedor
router.post('/:id/valoracion', authenticate, async (req, res) => {
  try {
    const { proveedorId, clienteId, calificacion } = req.body;

    // Verificar que el cliente no se califique a sí mismo
    if (proveedorId === clienteId) {
      return res.status(400).json({ error: 'No puedes calificarse a ti mismo.' });
    }

    // Buscar al proveedor
    const proveedor = await Provider.findById(proveedorId);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    // Verificar si el cliente ya ha calificado a este proveedor
    const existingRating = proveedor.valoraciones.find(v => v.usuarioId.toString() === clienteId.toString());
    if (existingRating) {
      // Si ya existe una valoración, actualizarla
      existingRating.calificacion = calificacion;
    } else {
      // Si no existe, agregar la valoración
      proveedor.valoraciones.push({ usuarioId: clienteId, calificacion });
    }

    // Recalcular el promedio de la calificación
    const averageRating = proveedor.valoraciones.reduce((sum, val) => sum + val.calificacion, 0) / proveedor.valoraciones.length;
    
    // Actualizar la calificación promedio en el proveedor
    proveedor.calificacion = averageRating;

    // Guardar el proveedor con la nueva valoración
    await proveedor.save();

    res.json({ success: 'Valoración agregada con éxito', promedio: averageRating });
  } catch (error) {
    console.error('Error al agregar valoración:', error);
    res.status(500).json({ error: 'Error al agregar valoración', details: error.message });
  }
});



module.exports = router;