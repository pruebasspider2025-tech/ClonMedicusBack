const express = require("express");
const router = express.Router();
const movimientoCajaController = require("../controllers/movimientoCajaController");

router.get("/movimientos", movimientoCajaController.getMovimientos);
router.post("/movimientos", movimientoCajaController.addMovimiento);
router.get("/movimientos/search", movimientoCajaController.searchMovimientos);
router.get(
  "/movimientos/ultimo-saldo",
  movimientoCajaController.getUltimoSaldo
); // Nueva ruta

module.exports = router;
