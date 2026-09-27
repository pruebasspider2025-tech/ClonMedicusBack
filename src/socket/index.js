// src/socket/index.js
const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  if (io) return io;

  const allowedOrigins = [
    "http://localhost:8080",
    "https://medicusclon.netlify.app",
    "https://medicussl.netlify.app",
    "https://medicusback.onrender.com",
    "https://mutant-back-reserva.onrender.com",
    "https://clonmedicusback.onrender.com",
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS (socket)'), false);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }
    socket.userId = socket.handshake.auth.userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id} (user: ${socket.userId})`);

    // ✅ Cada usuario se une a su propio room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      console.log(`   → unido al room user_${socket.userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket Server inicializado');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no inicializado');
  }
  return io;
};

/**
 * Emite un evento.
 * - Sin opciones → broadcast global
 * - Con { userId } → solo al room del usuario
 */
const emitEvent = (event, data, options = {}) => {
  try {
    const socketIO = getIO();

    if (options.userId) {
      // Solo al usuario específico
      socketIO.to(`user_${options.userId}`).emit(event, data);
      console.log(`📡 Evento "${event}" → user_${options.userId}`);
    } else {
      // Broadcast global
      socketIO.emit(event, data);
      console.log(`📡 Evento "${event}" → broadcast`);
    }
  } catch (error) {
    console.error('Error emitiendo evento WebSocket:', error);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitEvent,
};