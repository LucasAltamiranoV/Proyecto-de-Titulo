// src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message'); // <-- Nombre exacto y ruta correcta
const path    = require('path');  
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🔗 MongoDB conectado'))
  .catch((err) => console.error('❌ Error de conexión MongoDB:', err));

// Importar rutas
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const UserRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

// para que /uploads/archivo.png sirva la imagen
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', UserRoutes);  

app.get('/', (req, res) => res.send('Servidor backend corriendo'));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  const { userId, userModel } = socket.handshake.query;
  if (!userId || !userModel) return;

  const salaPropia = `${userModel}_${userId}`;
  socket.join(salaPropia);

  // Cuando recibimos un mensaje por Socket.IO
  socket.on('enviar-mensaje', async (data) => {
    try {
      const { emisorId, emisorModel, receptorId, receptorModel, contenido } = data;
      // 1) Guardar en MongoDB
      const nuevoMensaje = new Message({
        emisor: emisorId,
        emisorModel,
        receptor: receptorId,
        receptorModel,
        contenido,
        enviadoEn: Date.now()
      });
      await nuevoMensaje.save();

      // 2) Emitir al receptor
      const salaReceptor = `${receptorModel}_${receptorId}`;
      io.to(salaReceptor).emit('recibir-mensaje', {
        _id: nuevoMensaje._id,
        emisor: emisorId,
        emisorModel,
        receptor: receptorId,
        receptorModel,
        contenido,
        enviadoEn: nuevoMensaje.enviadoEn
      });

      // 3) Avisa al emisor que el mensaje se guardó
      io.to(salaPropia).emit('mensaje-guardado', {
        _id: nuevoMensaje._id,
        emisor: emisorId,
        emisorModel,
        receptor: receptorId,
        receptorModel,
        contenido,
        enviadoEn: nuevoMensaje.enviadoEn
      });
    } catch (err) {
      console.error('❌ Error guardando mensaje:', err);
      io.to(salaPropia).emit('error-mensaje', {
        mensaje: 'No se pudo guardar el mensaje.'
      });
    }
  });

  socket.on('disconnect', () => {
    socket.leave(salaPropia);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`));
