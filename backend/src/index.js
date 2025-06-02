require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔗 MongoDB conectado'))
  .catch(err => console.error('❌ Error de conexión MongoDB:', err));

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor backend corriendo');
});

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL del frontend
    methods: ['GET', 'POST']
  }
});

// Manejo de eventos Socket.io
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado:', socket.id);

  // Recibir y reenviar mensaje
  socket.on('enviar-mensaje', (mensaje) => {
    console.log('📨 Mensaje recibido:', mensaje);
    socket.broadcast.emit('recibir-mensaje', mensaje); // Enviar a todos menos al emisor
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
