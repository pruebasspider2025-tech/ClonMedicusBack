const express = require("express");
const router = express.Router();
const historialPagosController = require("../controllers/historialPagosController");

router.get("/historial-pagos", historialPagosController.getHistorialPagos);
router.get("/historial-pagos/doctores", historialPagosController.getDoctores);

module.exports = router;
