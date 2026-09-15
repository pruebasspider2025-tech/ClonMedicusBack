// listapacientesController.js
const listapacientesService = require("../services/listapacientesService");

const getPacientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || "";

    const result = await listapacientesService.getPacientes({
      page,
      limit,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NUEVO HANDLER: Verificar CI (con opción de excluir un paciente)
const checkCiHandler = async (req, res) => {
  try {
    const { ci } = req.params;
    const excludeId = req.query.excludeId ? parseInt(req.query.excludeId, 10) : null;

    if (!ci) {
      return res.status(400).json({ error: "CI es requerido" });
    }

    const pacienteExistente = await listapacientesService.checkCiExists(ci, excludeId);

    res.status(200).json({
      exists: !!pacienteExistente,
      paciente: pacienteExistente,
    });
  } catch (error) {
    console.error("Error checking CI:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const updatePaciente = async (req, res) => {
  try {
    // ✅ Validación adicional: verificar CI antes de actualizar
    const { ci } = req.body;
    if (ci) {
      const ciExistente = await listapacientesService.checkCiExists(
        ci,
        parseInt(req.params.id, 10)
      );
      if (ciExistente) {
        return res.status(400).json({ error: "El CI ya existe" });
      }
    }

    const updatedPaciente = await listapacientesService.updatePaciente(
      req.params.id,
      req.body
    );
    if (!updatedPaciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.status(200).json(updatedPaciente);
  } catch (error) {
    // ✅ Manejar error de constraint unique_ci de PostgreSQL
    if (error.code === "23505" && error.constraint === "unique_ci") {
      return res.status(400).json({ error: "El CI ya existe" });
    }
    res.status(500).json({ message: error.message });
  }
};

const deletePaciente = async (req, res) => {
  try {
    const updatedPaciente = await listapacientesService.deletePaciente(
      req.params.id
    );
    if (!updatedPaciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.status(200).json({ message: "Paciente marcado como inactivo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPacientes,
  updatePaciente,
  deletePaciente,
  checkCiHandler,
};