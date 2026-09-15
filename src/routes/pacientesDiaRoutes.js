const express = require("express");
const {
  getPacientesDelDiaHandler,
} = require("../controllers/pacientesDiaController");

const router = express.Router();

// Ruta para obtener los pacientes del día
router.get("/pacientes-dia", getPacientesDelDiaHandler);

module.exports = router;
