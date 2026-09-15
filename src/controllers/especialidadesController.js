const especialidadesService = require("../services/especialidadesService");

const obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await especialidadesService.obtenerEspecialidades();
    res.json(especialidades);
  } catch (err) {
    console.error("Error al obtener especialidades:", err);
    res.status(500).json({ error: "Error al obtener especialidades" });
  }
};

module.exports = {
  obtenerEspecialidades,
};
