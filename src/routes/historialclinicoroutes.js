const express = require("express");
const router = express.Router();
const historialClinicoController = require("../controllers/historialclinicocontroller");

router.get(
  "/historialclinica/:idPaciente",
  (req, res, next) => {
    console.log("Query params:", req.query); // Para debug
    next();
  },
  historialClinicoController.getHistorialClinico
);
router.post(
  "/historialclinica/:idPaciente/consulta",
  historialClinicoController.addConsulta
);
router.post("/pagoshistorialclinica", historialClinicoController.addPago);
router.put(
  "/pacienteshistorialclinica/:idPaciente/notas",
  historialClinicoController.updatePacienteNotas
);
router.get(
  "/servicioshistorialclinica",
  historialClinicoController.getServicios
);
router.put(
  "/pacienteshistorialclinica/:idPaciente",
  historialClinicoController.updatePaciente
);
router.put(
  "/citas/:idcita/estado",
  historialClinicoController.updateCitaEstado
);
router.get("/doctorinfo/:userId", historialClinicoController.getDoctorInfo);

// NUEVA RUTA: Actualizar antecedente
router.put(
  "/historialclinica/antecedente/:idhistoria",
  historialClinicoController.updateAntecedente
);

module.exports = router;