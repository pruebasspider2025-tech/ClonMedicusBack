const serviciosService = require("../services/serviciosService");

const obtenerServicios = async (req, res) => {
  try {
    const servicios = await serviciosService.obtenerServicios();
    res.json(servicios);
  } catch (err) {
    console.error("Error al obtener servicios:", err);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

const crearServicio = async (req, res) => {
  const { nombre, precio, idespecialidad } = req.body;
  try {
    const nuevoServicio = await serviciosService.crearServicio(
      nombre,
      precio,
      idespecialidad
    );
    res.status(201).json(nuevoServicio);
  } catch (err) {
    console.error("Error al crear servicio:", err);
    res.status(500).json({ error: "Error al crear servicio" });
  }
};

const actualizarServicio = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, idespecialidad } = req.body;
  try {
    const servicioActualizado = await serviciosService.actualizarServicio(
      id,
      nombre,
      precio,
      idespecialidad
    );
    res.json(servicioActualizado);
  } catch (err) {
    console.error("Error al actualizar servicio:", err);
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
};

const eliminarServicio = async (req, res) => {
  const { id } = req.params;
  try {
    await serviciosService.eliminarServicio(id);
    res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar servicio:", err);
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
};

module.exports = {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};