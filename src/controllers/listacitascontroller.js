const listacitasService = require("../services/listacitasservices");

const getCitas = async (req, res) => {
  try {
    const citas = await listacitasService.getCitas();
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCitasHistorial = async (req, res) => {
  const { fechaInicio, fechaFin, servicios, tipoReporte, estados } = req.query;

  try {
    const citas = await listacitasService.getCitasHistorial(
      fechaInicio,
      fechaFin,
      servicios,
      tipoReporte || 'todos',
      estados
    );
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getServicios = async (req, res) => {
  try {
    const servicios = await listacitasService.getServicios();
    res.json(servicios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEstadoCita = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const citaActualizada = await listacitasService.updateEstadoCita(
      id,
      estado
    );
    res.json(citaActualizada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCita = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body; // Solo para visual, no se guarda

  try {
    // Solo actualizamos el estado a cancelado, no eliminamos físicamente
    const citaCancelada = await listacitasService.deleteCita(id);
    res.json({ 
      message: "Cita cancelada correctamente",
      motivo: motivo || "Sin motivo especificado",
      cita: citaCancelada
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const procesarPago = async (req, res) => {
  const { id } = req.params;
  const { metodoPago } = req.body;

  try {
    const pagoProcesado = await listacitasService.procesarPago(id, metodoPago);
    res.json(pagoProcesado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCitas,
  getCitasHistorial,
  getServicios,
  updateEstadoCita,
  deleteCita,
  procesarPago,
};