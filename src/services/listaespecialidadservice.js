// listaespecialidadservice.js
const { pool } = require("../../db");

const obtenerEspecialidades = async () => {
  const query = "SELECT * FROM especialidades WHERE estado = 1";
  const { rows } = await pool.query(query);
  return rows;
};

const crearEspecialidad = async (nombre) => {
  const query = "INSERT INTO especialidades (nombre) VALUES ($1) RETURNING *";
  const { rows } = await pool.query(query, [nombre]);
  return rows[0];
};

const actualizarEspecialidad = async (id, nombre) => {
  const query =
    "UPDATE especialidades SET nombre = $1 WHERE idespecialidad = $2 AND estado = 1 RETURNING *";
  const { rows } = await pool.query(query, [nombre, id]);
  return rows[0];
};

const eliminarEspecialidad = async (id) => {
  const query =
    "UPDATE especialidades SET estado = 0 WHERE idespecialidad = $1";
  await pool.query(query, [id]);
};

module.exports = {
  obtenerEspecialidades,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad,
};
