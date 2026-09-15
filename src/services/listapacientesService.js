// listapacientesService.js
const { pool } = require("../../db");

const getPacientes = async ({ page = 1, limit = 20, search = "" }) => {
  const offset = (page - 1) * limit;
  const searchParam = `%${search.toLowerCase()}%`;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM pacientes p
    WHERE p.estado = 0
      AND (
        $1 = '%%' 
        OR LOWER(p.nombre_completo) LIKE $1 
        OR LOWER(p.ci) LIKE $1
      )
  `;

  const dataQuery = `
    SELECT p.*, MAX(h.fecha) as ultima_consulta
    FROM pacientes p
    LEFT JOIN historia_clinico h ON p.idpaciente = h.idpaciente
    WHERE p.estado = 0
      AND (
        $1 = '%%' 
        OR LOWER(p.nombre_completo) LIKE $1 
        OR LOWER(p.ci) LIKE $1
      )
    GROUP BY p.idpaciente
    ORDER BY p.idpaciente DESC
    LIMIT $2 OFFSET $3
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, [searchParam]),
    pool.query(dataQuery, [searchParam, limit, offset]),
  ]);

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ✅ NUEVA FUNCIÓN: Verificar si un CI ya existe (excluyendo opcionalmente un paciente)
const checkCiExists = async (ci, excludeId = null) => {
  let query = `
    SELECT idpaciente, nombre_completo
    FROM pacientes
    WHERE ci = $1 AND estado = 0
  `;
  const params = [ci];

  // ✅ Excluir al propio paciente al editar
  if (excludeId) {
    query += ` AND idpaciente != $2`;
    params.push(excludeId);
  }

  query += ` LIMIT 1`;

  const result = await pool.query(query, params);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const updatePaciente = async (id, paciente) => {
  const {
    nombre_completo,
    telefono,
    correo,
    fecha_nacimiento,
    tipo_sangre,
    genero,
    direccion,
    alergias,
    enfermedad_base,
    ci,
  } = paciente;
  const query = `
    UPDATE pacientes
    SET nombre_completo = $1, telefono = $2, correo = $3, fecha_nacimiento = $4, tipo_sangre = $5, genero = $6, direccion = $7, alergias = $8, enfermedad_base = $9, ci = $10
    WHERE idpaciente = $11
    RETURNING *
  `;
  const values = [
    nombre_completo,
    telefono,
    correo,
    fecha_nacimiento,
    tipo_sangre,
    genero,
    direccion,
    alergias,
    enfermedad_base,
    ci,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deletePaciente = async (id) => {
  const query =
    "UPDATE pacientes SET estado = 1 WHERE idpaciente = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  getPacientes,
  updatePaciente,
  deletePaciente,
  checkCiExists,
};