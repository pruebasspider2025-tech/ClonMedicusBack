const { pool } = require("../../db");

const obtenerEspecialidades = async () => {
  const result = await pool.query("SELECT * FROM especialidades WHERE estado = 1");
  return result.rows;
};

module.exports = {
  obtenerEspecialidades,
};
