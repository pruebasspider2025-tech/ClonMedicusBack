const { pool } = require("../../db");

const getDoctorAppointments = async (doctorId, startDate, endDate) => {
  let query = `
    SELECT 
      c.idcita as id,
      p.nombre_completo as patientname,
      p.idpaciente as patientid,
      u.nombre_completo as doctorname,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('nombre', s.nombre) ORDER BY s.nombre
        ) FILTER (WHERE s.idservicio IS NOT NULL),
        '[]'
      ) AS services,
      COALESCE(MAX(pa.monto), 0) as price,
      c.fecha as date,
      TO_CHAR(c.hora, 'HH24:MI') as time,
      c.estado as status
    FROM citas c
    JOIN pacientes p ON c.idpaciente = p.idpaciente
    JOIN usuarios u ON c.iddoctor = u.idusuario
    LEFT JOIN cita_servicio cs ON c.idcita = cs.idcita
    LEFT JOIN servicios s ON cs.idservicio = s.idservicio
    LEFT JOIN pagos pa ON c.idcita = pa.idcita
    WHERE c.iddoctor = $1 
      AND c.estado IN (0, 1, 2, 3, 4)
  `;
  
  let params = [doctorId, startDate];
  
  if (endDate) {
    query += ` AND c.fecha >= $2 AND c.fecha <= $3`;
    params.push(endDate);
  } else {
    query += ` AND c.fecha = $2`;
  }

  query += ` 
    GROUP BY c.idcita, p.nombre_completo, p.idpaciente, u.nombre_completo, c.fecha, c.hora, c.estado 
    ORDER BY c.fecha ASC, c.hora ASC
  `;
  
  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  getDoctorAppointments,
};