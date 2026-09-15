// src/controllers/cobroscontroller.js
const cobrosService = require("../services/cobrosservices");

const getTransacciones = async (req, res) => {
  try {
    const transacciones = await cobrosService.getTransacciones();
    res.json(transacciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTransaccion = async (req, res) => {
  const { id } = req.params;
  const { metodoPago, userId, monto } = req.body;

  try {
    const transaccionActualizada = await cobrosService.updateTransaccion(
      id,
      metodoPago,
      userId,
      monto // Pasar el monto al servicio
    );
    res.json(transaccionActualizada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTransacciones,
  updateTransaccion,
};
