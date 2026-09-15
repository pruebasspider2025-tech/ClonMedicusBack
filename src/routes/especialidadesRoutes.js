const express = require("express");
const especialidadesController = require("../controllers/especialidadesController");

const router = express.Router();

// Ruta para obtener especialidades
router.get("/especialidades", especialidadesController.obtenerEspecialidades); // GET /api/especialidades/e

module.exports = router;
