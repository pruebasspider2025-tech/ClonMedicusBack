// listaespecialidadroutes.js
const express = require("express");
const router = express.Router();
const especialidadController = require("../controllers/listaespecialidadcontroller");

// Rutas específicas para la vista listaespecialidad
router.get("/listaespecialidad", especialidadController.obtenerEspecialidades);
router.post("/listaespecialidad", especialidadController.crearEspecialidad);
router.put(
  "/listaespecialidad/:id",
  especialidadController.actualizarEspecialidad
);
router.delete(
  "/listaespecialidad/:id",
  especialidadController.eliminarEspecialidad
);

module.exports = router;
