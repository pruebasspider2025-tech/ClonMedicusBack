const { pool } = require("../../db");

const getPacientesDelDia = async (userId) => {
  const query = `
    SELECT 
      c.idcita,
      c.fecha,
      c.hora,
      c.estado,
      p.idpaciente,
      p.nombre_completo AS nombre,
      p.telefono,
      p.fecha_nacimiento,
      STRING_AGG(s.nombre, E'\n' ORDER BY s.nombre) AS motivo,
      SUM(s.precio) as price
    FROM citas c
    JOIN pacientes p ON c.idpaciente = p.idpaciente
    JOIN cita_servicio cs ON c.idcita = cs.idcita
    JOIN servicios s ON cs.idservicio = s.idservicio
    WHERE c.iddoctor = $1
      AND c.fecha = (CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz')::date 
      AND c.estado IN (0, 1, 2, 4)
    GROUP BY 
      c.idcita, c.fecha, c.hora, c.estado, 
      p.idpaciente, p.nombre_completo, p.telefono, p.fecha_nacimiento
    ORDER BY 
      c.hora ASC;
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error("Error en la consulta SQL:", error);
    throw error;
  }
};

module.exports = {
  getPacientesDelDia,
};
