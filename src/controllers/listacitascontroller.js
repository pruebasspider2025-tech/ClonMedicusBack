const listacitasService = require("../services/listacitasservices");
const SocketService = require("../services/SocketService");

// Helper: extrae info del usuario desde req
const getUserInfo = (req) => {
  const user = req.user || {};
  return {
    userId: user.id_usuario || user.id || null,
    username: user.usuario || user.username || "sistema",
  };
};

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
      tipoReporte || "todos",
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
    const citaActualizada = await listacitasService.updateEstadoCita(id, estado);

    // 🔌 WebSocket
    const userInfo = getUserInfo(req);
    SocketService.notifyCitaEstadoActualizado(
      { idcita: Number(id), estado: Number(estado) },
      userInfo
    );
    SocketService.notifyRefresh("citas", userInfo);

    res.json(citaActualizada);
  } catch (err) {
    console.error("❌ Error en updateEstadoCita:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteCita = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const citaCancelada = await listacitasService.deleteCita(id);

    // 🔌 WebSocket
    const userInfo = getUserInfo(req);
    SocketService.notifyCitaCancelada(
      { idcita: Number(id), motivo: motivo || "Sin motivo especificado" },
      userInfo
    );
    SocketService.notifyRefresh("citas", userInfo);

    res.json({
      message: "Cita cancelada correctamente",
      motivo: motivo || "Sin motivo especificado",
      cita: citaCancelada,
    });
  } catch (err) {
    console.error("❌ Error en deleteCita:", err);
    res.status(500).json({ error: err.message });
  }
};

const procesarPago = async (req, res) => {
  const { id } = req.params;
  const { metodoPago } = req.body;

  try {
    const pagoProcesado = await listacitasService.procesarPago(id, metodoPago);

    // 🔌 WebSocket
    const userInfo = getUserInfo(req);
    SocketService.notifyPagoProcesado(
      { idcita: Number(id), metodoPago },
      userInfo
    );
    SocketService.notifyRefresh("citas", userInfo);
    SocketService.notifyRefresh("caja", userInfo);

    res.json(pagoProcesado);
  } catch (err) {
    console.error("❌ Error en procesarPago:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Reordena las citas del día.
 * Body esperado:
 *   { orden: [{ idcita: 1, numeroLlegada: 1 }, ...] }
 */
const reordenarCitas = async (req, res) => {
  const { orden } = req.body;

  try {
    if (!Array.isArray(orden)) {
      return res
        .status(400)
        .json({ error: "El campo 'orden' debe ser un array" });
    }

    console.log("🔄 Reordenando citas:", orden);

    const resultado = await listacitasService.reordenarCitas(orden);

    console.log("✅ Reordenamiento OK:", resultado);

    // 🔌 WebSocket
    const userInfo = getUserInfo(req);
    SocketService.notifyCitasReordenadas({ orden: resultado }, userInfo);

    res.json({ message: "Orden actualizado correctamente", orden: resultado });
  } catch (err) {
    console.error("❌ Error en reordenarCitas:", err); // <-- ESTO ES CLAVE
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
  reordenarCitas,
};