const { getPacientesDelDia } = require("../services/pacientesDiaService");

const getPacientesDelDiaHandler = async (req, res) => {
  try {
    const userId = req.query.userId; // Obtén el userId desde los parámetros de la solicitud

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }

    const pacientes = await getPacientesDelDia(userId);
    res.json(pacientes);
  } catch (error) {
    console.error("Error fetching pacientes del día:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getPacientesDelDiaHandler,
};
