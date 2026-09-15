const { pool } = require("../../db");

const getDoctorsList = async (req, res) => {
  try {
    const query = `
      SELECT u.idusuario as id, u.nombre_completo as name 
      FROM usuarios u 
      WHERE u.rol = 1 AND u.estado = 1
      ORDER BY u.nombre_completo ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDoctorsList,
};
