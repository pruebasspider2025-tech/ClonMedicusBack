const { pool } = require("../../db");

const getHistorialClinico = async (idPaciente, iddoctor) => {
  if (!idPaciente || !iddoctor) {
    throw new Error("Se requieren ambos IDs (paciente y doctor)");
  }

  const especialidadQuery = `
    SELECT e.idespecialidad, e.nombre 
    FROM doctor_especialidad de
    JOIN especialidades e ON de.idespecialidad = e.idespecialidad
    WHERE de.iddoctor = $1
    LIMIT 1;
  `;
  const especialidadResult = await pool.query(especialidadQuery, [iddoctor]);
  const especialidadDoctor = especialidadResult.rows[0]?.nombre || "General";

  const query = `
    WITH citas_especialidad AS (
      SELECT DISTINCT ON (hc.idcita)
        hc.idhistoria,
        hc.idpaciente,
        hc.idcita,
        hc.antecedente,
        hc.fecha AS fecha_historia,
        s.idservicio,
        e.nombre AS especialidad,
        e.idespecialidad
      FROM historia_clinico hc
      JOIN citas c ON hc.idcita = c.idcita
      JOIN cita_servicio cs ON c.idcita = cs.idcita
      JOIN servicios s ON cs.idservicio = s.idservicio
      LEFT JOIN especialidades e ON s.idespecialidad = e.idespecialidad
      WHERE hc.idpaciente = $1
    )
    SELECT 
      idhistoria,
      idpaciente,
      idcita,
      antecedente,
      fecha_historia,
      especialidad,
      idespecialidad
    FROM citas_especialidad
    ORDER BY idespecialidad, fecha_historia DESC;
  `;

  const result = await pool.query(query, [idPaciente]);

  const historialPorEspecialidad = {};
  result.rows.forEach((row) => {
    const especialidad = row.especialidad || "General";
    if (!historialPorEspecialidad[especialidad]) {
      historialPorEspecialidad[especialidad] = {
        idespecialidad: row.idespecialidad,
        historiales: [],
      };
    }
    historialPorEspecialidad[especialidad].historiales.push({
      idhistoria: row.idhistoria,
      antecedente: row.antecedente,
      fecha_historia: row.fecha_historia,
    });
  });

  const pacienteQuery = `
    SELECT 
      idpaciente, 
      nombre_completo, 
      telefono, 
      correo, 
      fecha_nacimiento, 
      tipo_sangre, 
      genero, 
      direccion, 
      alergias, 
      enfermedad_base,
      notas
    FROM pacientes
    WHERE idpaciente = $1;
  `;
  const pacienteResult = await pool.query(pacienteQuery, [idPaciente]);

  return {
    ...pacienteResult.rows[0],
    historialPorEspecialidad,
    especialidadDefault: especialidadDoctor,
  };
};

const addConsulta = async (idPaciente, idcita, antecedente, servicios) => {
  const query = `
    INSERT INTO historia_clinico (idpaciente, idcita, antecedente, fecha)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz')
    RETURNING *;
  `;
  const result = await pool.query(query, [idPaciente, idcita, antecedente]);

  if (servicios && servicios.length > 0) {
    await addServiciosCita(idcita, servicios);
  }

  return result.rows[0];
};

const addServiciosCita = async (idcita, servicios) => {
  if (!servicios || servicios.length === 0) return;

  const values = servicios.map(servicio => [idcita, servicio.idservicio]);

  const query = `
    INSERT INTO cita_servicio (idcita, idservicio)
    VALUES ${values.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(', ')}
    ON CONFLICT (idcita, idservicio) DO NOTHING;
  `;
  
  const flatValues = values.flat();
  
  try {
    const result = await pool.query(query, flatValues);
    return result;
  } catch (error) {
    throw error;
  }
};

const addPago = async (idcita, monto) => {
  const query = `
    INSERT INTO pagos (idcita, monto, metodo_pago, fecha, estado)
    VALUES ($1, $2, NULL, CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz', 0)
    RETURNING *;
  `;
  const result = await pool.query(query, [idcita, monto]);
  return result.rows[0];
};

const updatePacienteNotas = async (idPaciente, notas) => {
  const query = `
    UPDATE pacientes 
    SET notas = $1
    WHERE idpaciente = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [notas, idPaciente]);
  return result.rows[0];
};

const getServicios = async (userId) => {
  const query = `
    SELECT s.idservicio, s.nombre, s.precio, e.nombre as especialidad
    FROM servicios s
    JOIN especialidades e ON s.idespecialidad = e.idespecialidad
    JOIN doctor_especialidad de ON e.idespecialidad = de.idespecialidad
    WHERE de.iddoctor = $1 AND s.estado = 1;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const updatePaciente = async (
  idPaciente,
  nombre_completo,
  telefono,
  fecha_nacimiento,
  tipo_sangre,
  genero,
  direccion,
  alergias,
  enfermedad_base,
  notas
) => {
  const query = `
    UPDATE pacientes 
    SET 
      nombre_completo = $1,
      telefono = $2,
      fecha_nacimiento = $3,
      tipo_sangre = $4,
      genero = $5,
      direccion = $6,
      alergias = $7,
      enfermedad_base = $8,
      notas = COALESCE($9, notas)
    WHERE idpaciente = $10
    RETURNING *;
  `;
  const values = [
    nombre_completo,
    telefono,
    fecha_nacimiento,
    tipo_sangre,
    genero,
    direccion,
    alergias,
    enfermedad_base,
    notas,
    idPaciente,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateCitaEstado = async (idcita, estado) => {
  const query = `
    UPDATE citas 
    SET estado = $1
    WHERE idcita = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [estado, idcita]);
  return result.rows[0];
};

const getDoctorInfo = async (userId) => {
  const query = `
    SELECT u.nombre_completo, e.nombre as especialidad
    FROM usuarios u
    JOIN doctor_especialidad de ON u.idusuario = de.iddoctor
    JOIN especialidades e ON de.idespecialidad = e.idespecialidad
    WHERE u.idusuario = $1
    LIMIT 1;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || { nombre_completo: "", especialidad: "" };
};

// NUEVA FUNCIÓN: Actualizar antecedente (solo texto)
const updateAntecedente = async (idhistoria, antecedente) => {
  const query = `
    UPDATE historia_clinico 
    SET antecedente = $1
    WHERE idhistoria = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [antecedente, idhistoria]);
  return result.rows[0];
};

// NUEVA FUNCIÓN: Verificar si una historia es de hoy
const esHistoriaDeHoy = async (idhistoria) => {
  const query = `
    SELECT idhistoria, fecha
    FROM historia_clinico
    WHERE idhistoria = $1
      AND DATE(fecha AT TIME ZONE 'America/La_Paz') = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz');
  `;
  const result = await pool.query(query, [idhistoria]);
  return result.rows.length > 0;
};

module.exports = {
  getHistorialClinico,
  addConsulta,
  addPago,
  updatePacienteNotas,
  getServicios,
  updatePaciente,
  updateCitaEstado,
  getDoctorInfo,
  updateAntecedente,
  esHistoriaDeHoy,
};