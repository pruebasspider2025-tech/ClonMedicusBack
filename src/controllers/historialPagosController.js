const historialPagosService = require("../services/historialPagosService");

exports.getHistorialPagos = async (req, res) => {
  try {
    const { busqueda, fechaInicio, fechaFin, iddoctor, pagina, exportar } = req.query;
    const numeroPagina = Number(pagina || 1);
    if (!Number.isSafeInteger(numeroPagina) || numeroPagina < 1) {
      return res.status(400).json({ error: "Página inválida" });
    }
    const pagos = await historialPagosService.getHistorialPagos({
      busqueda, fechaInicio: fechaInicio || null, fechaFin: fechaFin || null,
      iddoctor: iddoctor || null, pagina: numeroPagina, exportar: exportar === "true",
    });
    res.json(pagos);
  } catch (err) {
    console.error("Error al obtener historial de pagos:", err);
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
