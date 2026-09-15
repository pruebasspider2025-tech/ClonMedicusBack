const { pool } = require("../../db");

const getPacientes = async (userId, page = 1, pageSize = 100, searchTerm = '') => {
  const offset = (page - 1) * pageSize;
  
  let searchCondition = '';
  const queryParams = [userId];
  let paramIndex = 2;
  
  if (searchTerm && searchTerm.trim() !== '') {
    searchCondition = ` AND LOWER(p.nombre_completo) LIKE $${paramIndex}`;
    queryParams.push(`%${searchTerm.toLowerCase()}%`);
    paramIndex++;
  }
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM pacientes p
    INNER JOIN paciente_doctor pd ON p.idpaciente = pd.idpaciente
    WHERE pd.iddoctor = $1 AND p.estado = 0
    ${searchCondition}
  `;
  
  const countResult = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / pageSize);
  
  const paginatedParams = [...queryParams];
  paginatedParams.push(pageSize, offset);
  
  const pacientesQuery = `
    SELECT
      p.idpaciente AS id,
      p.nombre_completo AS name,
      p.telefono AS phone,
      p.fecha_nacimiento AS birthdate,
      p.tipo_sangre AS bloodType,
      p.ci AS ci,
      p.genero AS gender,
      TO_CHAR(MAX(h.fecha), 'YYYY-MM-DD') AS lastVisit
    FROM pacientes p
    INNER JOIN paciente_doctor pd ON p.idpaciente = pd.idpaciente
    LEFT JOIN historia_clinico h ON p.idpaciente = h.idpaciente
    WHERE pd.iddoctor = $1 AND p.estado = 0
    ${searchCondition}
    GROUP BY p.idpaciente
    ORDER BY p.nombre_completo ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;
  
  const pacientesResult = await pool.query(pacientesQuery, paginatedParams);
  
  return {
    patients: pacientesResult.rows,
    currentPage: page,
    totalPages: totalPages,
    total: total,
    pageSize: pageSize,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    searchTerm: searchTerm
  };
};

// ✅ NUEVA FUNCIÓN: Verificar si el CI ya existe
const checkCiExists = async (ci) => {
  const query = `
    SELECT idpaciente, nombre_completo
    FROM pacientes
    WHERE ci = $1 AND estado = 0
    LIMIT 1;
  `;
  const result = await pool.query(query, [ci]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const addPaciente = async (paciente) => {
  const query = `
    INSERT INTO pacientes (
      nombre_completo, telefono, correo, fecha_nacimiento, tipo_sangre, genero, direccion, alergias, enfermedad_base, ci
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    paciente.nombre_Completo,
    paciente.telefono,
    paciente.correo,
    paciente.fecha_Nacimiento,
    paciente.tipo_Sangre,
    paciente.genero,
    paciente.direccion,
    paciente.alergias,
    paciente.enfermedad_base,
    paciente.ci,
  ];

  try {
    const result = await pool.query(query, values);
    
    const doctorId = paciente.doctorId;
    if (doctorId) {
      const doctorQuery = `
        INSERT INTO paciente_doctor (idpaciente, iddoctor) 
        VALUES ($1, $2)
      `;
      await pool.query(doctorQuery, [result.rows[0].idpaciente, doctorId]);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("Error en la consulta SQL:", error);
    throw error;
  }
};

module.exports = {
  getPacientes,
  addPaciente,
  checkCiExists,
};