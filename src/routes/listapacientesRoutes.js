// listapacientesRoutes.js
const express = require("express");
const router = express.Router();
const listapacientesController = require("../controllers/listapacientesController");

router.get("/listapacientes", listapacientesController.getPacientes);
// ✅ NUEVA RUTA: Verificar CI (con opción ?excludeId=X)
router.get("/listapacientes/check-ci/:ci", listapacientesController.checkCiHandler);
router.put("/listapacientes/:id", listapacientesController.updatePaciente);
router.delete("/listapacientes/:id", listapacientesController.deletePaciente);

module.exports = router;