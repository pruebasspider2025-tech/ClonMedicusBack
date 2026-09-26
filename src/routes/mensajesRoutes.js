// src/routes/mensajesRoutes.js
const express = require("express");
const {
  getContactosController,
  getMensajesController,
  enviarMensajeController,
  marcarLeidosController,
  getNoLeidosController,
} = require("../controllers/mensajescontroller");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas requieren estar autenticado
router.use(authenticateToken);

// GET    /api/mensajes/contactos              → lista de contactos + no leídos
// GET    /api/mensajes/no-leidos              → { porContacto, total }
// GET    /api/mensajes/:contactoId            → mensajes con ese contacto
// POST   /api/mensajes/:contactoId            → enviar mensaje { texto }
// PATCH  /api/mensajes/:contactoId/leidos     → marcar como leídos

router.get("/contactos", getContactosController);
router.get("/no-leidos", getNoLeidosController);
router.get("/:contactoId", getMensajesController);
router.post("/:contactoId", enviarMensajeController);
router.patch("/:contactoId/leidos", marcarLeidosController);

module.exports = router;