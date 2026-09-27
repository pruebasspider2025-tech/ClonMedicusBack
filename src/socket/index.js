// src/socket/index.js
const { Server } = require('socket.io');

let io = null;

/**
 * Inicializa el servidor WebSocket
 * @param {http.Server} server - Servidor HTTP de Express
 */
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

  // Middleware de autenticación (opcional pero recomendado)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }
    // Aquí podrías validar el JWT si quieres
    socket.userId = socket.handshake.auth.userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

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
 * Emite un evento a TODOS los clientes conectados.
 * (En esta clínica no hay multi-negocio/multi-tienda, así que es broadcast global)
 */
const emitEvent = (event, data) => {
  try {
    const socketIO = getIO();
    socketIO.emit(event, data);
    console.log(`📡 Evento emitido: ${event}`);
  } catch (error) {
    console.error('Error emitiendo evento WebSocket:', error);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitEvent,
};