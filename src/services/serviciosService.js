const { pool } = require("../../db");

const obtenerServicios = async () => {
  const result = await pool.query(`
    SELECT s.idservicio, s.nombre, s.precio, e.nombre AS especialidad, s.idespecialidad
    FROM servicios s
    LEFT JOIN especialidades e ON s.idespecialidad = e.idespecialidad
    WHERE s.estado = 1 AND e.estado = 1
  `);
  return result.rows;
};

const crearServicio = async (nombre, precio, idespecialidad) => {
  const result = await pool.query(
    "INSERT INTO servicios (nombre, precio, idespecialidad, estado) VALUES ($1, $2, $3, $4) RETURNING *",
    [nombre, precio, idespecialidad, 1]
  );
  return result.rows[0];
};

const actualizarServicio = async (id, nombre, precio, idespecialidad) => {
  const result = await pool.query(
    "UPDATE servicios SET nombre = $1, precio = $2, idespecialidad = $3 WHERE idservicio = $4 RETURNING *",
    [nombre, precio, idespecialidad, id]
  );
  return result.rows[0];
};

const eliminarServicio = async (id) => {
  const result = await pool.query(
    "UPDATE servicios SET estado = 0 WHERE idservicio = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

module.exports = {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};