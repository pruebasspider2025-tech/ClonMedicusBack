// listaespecialidadcontroller.js
const especialidadService = require("../services/listaespecialidadservice");

const obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await especialidadService.obtenerEspecialidades();
    res.status(200).json(especialidades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crearEspecialidad = async (req, res) => {
  const { nombre } = req.body;
  try {
    const nuevaEspecialidad = await especialidadService.crearEspecialidad(
      nombre
    );
    res.status(201).json(nuevaEspecialidad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarEspecialidad = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const especialidadActualizada =
      await especialidadService.actualizarEspecialidad(id, nombre);
    res.status(200).json(especialidadActualizada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarEspecialidad = async (req, res) => {
  const { id } = req.params;
  try {
    await especialidadService.eliminarEspecialidad(id);
    res.status(200).json({ message: "Especialidad eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  obtenerEspecialidades,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad,
};
