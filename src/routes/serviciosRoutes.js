const express = require("express");
const serviciosController = require("../controllers/serviciosController");

const router = express.Router();

// Rutas para servicios
router.get("/servicios", serviciosController.obtenerServicios); // GET /api/servicios
router.post("/servicios", serviciosController.crearServicio); // POST /api/servicios
router.put("/servicios/:id", serviciosController.actualizarServicio); // PUT /api/servicios/:id
router.delete("/servicios/:id", serviciosController.eliminarServicio); // DELETE /api/servicios/:id

module.exports = router;
