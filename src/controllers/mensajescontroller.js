// src/controllers/mensajescontroller.js
const service = require("../services/mensajesservice");
const SocketService = require("../services/SocketService");

/**
 * Helper local para obtener el id del usuario autenticado.
 */
const getUserId = (req) => {
  const id = req.user?.id ?? req.user?.idusuario ?? null;
  if (!id) {
    throw new Error("Usuario no autenticado");
  }
  return id;
};

const getContactosController = async (req, res) => {
  try {
    const userId = getUserId(req);
    const contactos = await service.getContactos(userId);
    res.json(contactos);
  } catch (error) {
    console.error("Error getContactos:", error);
    res.status(500).json({ message: "Error al obtener contactos" });
  }
};

const getMensajesController = async (req, res) => {
  try {
    const userId = getUserId(req);
    const otroUserId = parseInt(req.params.contactoId, 10);
    if (!otroUserId) {
      return res.status(400).json({ message: "contactoId inválido" });
    }
    const mensajes = await service.getMensajes(userId, otroUserId);
    res.json(mensajes);
  } catch (error) {
    console.error("Error getMensajes:", error);
    res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

const enviarMensajeController = async (req, res) => {
  try {
    const userId = getUserId(req);
    const otroUserId = parseInt(req.params.contactoId, 10);
    const { texto } = req.body;

    if (!otroUserId) {
      return res.status(400).json({ message: "contactoId inválido" });
    }
    if (!texto || !texto.trim()) {
      return res.status(400).json({ message: "El texto es requerido" });
    }

    const mensaje = await service.enviarMensaje(
      userId,
      otroUserId,
      texto.trim()
    );

    // 🔌 WebSocket: notificar al receptor
    SocketService.notifyNuevoMensaje(
      {
        mensaje,
        emisorId: userId,
        receptorId: otroUserId,
        conversacionId: mensaje.conversacionId,
      },
      otroUserId
    );

    res.status(201).json(mensaje);
  } catch (error) {
    console.error("Error enviarMensaje:", error);
    res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

const marcarLeidosController = async (req, res) => {
  try {
    const userId = getUserId(req);
    const otroUserId = parseInt(req.params.contactoId, 10);
    if (!otroUserId) {
      return res.status(400).json({ message: "contactoId inválido" });
    }

    await service.marcarComoLeidos(userId, otroUserId);

    // 🔌 WebSocket: notificar al OTRO usuario (el que escribió) que ya fue leído
    SocketService.notifyMensajesLeidos(
      {
        leidosPor: userId,
        contactoId: otroUserId,
      },
      otroUserId // ← a quién se le notifica (el que escribió los mensajes)
    );

    res.json({ message: "Mensajes marcados como leídos" });
  } catch (error) {
    console.error("Error marcarLeidos:", error);
    res.status(500).json({ message: "Error al marcar como leídos" });
  }
};

const getNoLeidosController = async (req, res) => {
  try {
    const userId = getUserId(req);
    const [porContacto, total] = await Promise.all([
      service.getNoLeidosPorContacto(userId),
      service.getTotalNoLeidos(userId),
    ]);
    res.json({ porContacto, total });
  } catch (error) {
    console.error("Error getNoLeidos:", error);
    res.status(500).json({ message: "Error al obtener no leídos" });
  }
};

module.exports = {
  getContactosController,
  getMensajesController,
  enviarMensajeController,
  marcarLeidosController,
  getNoLeidosController,
};