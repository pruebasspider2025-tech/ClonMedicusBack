const express = require("express");
const {
  getPacientesHandler,
  addPacienteHandler,
  checkCiHandler,
} = require("../controllers/pacientesController");

const router = express.Router();

router.get("/pacientes", getPacientesHandler);
router.post("/pacientes", addPacienteHandler);
// ✅ NUEVA RUTA: Verificar si un CI ya existe
router.get("/pacientes/check-ci/:ci", checkCiHandler);

module.exports = router;