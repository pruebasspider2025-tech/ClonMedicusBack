const express = require("express");
const router = express.Router();
const listacitasController = require("../controllers/listacitascontroller");

router.get("/listacitas", listacitasController.getCitas);
router.get("/citas/historial", listacitasController.getCitasHistorial);
router.get("/servicios", listacitasController.getServicios);
router.put("/citas/:id/estado", listacitasController.updateEstadoCita);
router.delete("/citas/:id", listacitasController.deleteCita);
router.post("/citas/:id/pago", listacitasController.procesarPago);

module.exports = router;