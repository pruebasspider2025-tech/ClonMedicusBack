const movimientoCajaService = require("../services/movimientoCajaService");

exports.getMovimientos = async (req, res) => {
  try {
    const movimientos = await movimientoCajaService.getMovimientos();
    res.json(movimientos);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.addMovimiento = async (req, res) => {
  const {
    idcaja,
    tipo_movimiento,
    monto,
    concepto,
    justificacion,
    idempleado,
  } = req.body;
  try {
    const nuevoMovimiento = await movimientoCajaService.addMovimiento({
      idcaja,
      tipo_movimiento,
      monto,
      concepto,
      justificacion,
      idempleado,
    });
    res.status(201).json(nuevoMovimiento);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.searchMovimientos = async (req, res) => {
  const { query } = req.query;
  try {
    const resultados = await movimientoCajaService.searchMovimientos(query);
    res.json(resultados);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Nuevo controlador para obtener el último saldo de la caja
exports.getUltimoSaldo = async (req, res) => {
  try {
    const saldo = await movimientoCajaService.getUltimoSaldo();
    res.json(saldo);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
