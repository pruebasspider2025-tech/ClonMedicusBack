const express = require("express");
const CitaController = require("../controllers/citaController");

const router = express.Router();

router.get("/pacientesagendarcita", CitaController.getPacientes);

// ✅ NUEVO: obtener paciente por ID
router.get("/pacienteagendarcita/:idpaciente", CitaController.getPacienteById);

router.get("/serviciosagendarcita", CitaController.getServicios);
router.get(
  "/doctoresagendarcita/servicio/:idservicio",
  CitaController.getDoctoresByServicio
);
router.get(
  "/horariosdisponibles/:iddoctor/:fecha",
  CitaController.getHorariosDisponibles
);
router.post("/citasagendarcita", CitaController.agendarCita);
router.post("/paciente_doctor", CitaController.insertPacienteDoctor);
router.get(
  "/verificar-cita-existente/:idpaciente/:iddoctor/:fecha",
  CitaController.verificarCitaExistente
);

module.exports = router;