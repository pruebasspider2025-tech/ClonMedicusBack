const historialPagosService = require("../services/historialPagosService");

exports.getHistorialPagos = async (req, res) => {
  try {
    const { busqueda, fechaInicio, fechaFin, iddoctor } = req.query;
    const filtros = {
      busqueda,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      iddoctor: iddoctor || null,
    };
    const pagos = await historialPagosService.getHistorialPagos(filtros);
    res.json(pagos);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getDoctores = async (req, res) => {
  try {
    const doctores = await historialPagosService.getDoctores();
    res.json(doctores);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
