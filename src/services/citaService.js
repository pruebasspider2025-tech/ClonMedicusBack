const { pool } = require("../../db");

// Horarios del sistema: la posición en este array + 1 = número de ficha.
const HORARIOS = [
  "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45",
  "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45", "20:00",
];

/**
 * Devuelve el número de ficha (1-based) según la hora.
 * Ej: "07:00" -> 1, "07:15" -> 2, "20:00" -> 53.
 * Devuelve null si la hora no está en la lista.
 */
const getNumeroLlegadaPorHora = (hora) => {
  const horaNorm = String(hora).slice(0, 5); // "HH:mm"
  const index = HORARIOS.indexOf(horaNorm);
  return index === -1 ? null : index + 1;
};

const CitaService = {
  getPacientes: async (searchTerm = "") => {
    const query = `
      SELECT * FROM pacientes 
      WHERE estado = 0 
      AND (
        nombre_completo ILIKE $1 OR 
        ci ILIKE $1
      )
      ORDER BY nombre_completo ASC
      LIMIT 20
    `;
    const { rows } = await pool.query(query, [`%${searchTerm}%`]);
    return rows;
  },

  getPacienteById: async (idpaciente) => {
    const query = `
      SELECT * FROM pacientes 
      WHERE idpaciente = $1 AND estado = 0
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [idpaciente]);
    return rows[0] || null;
  },

  getServicios: async () => {
    const query = "SELECT * FROM servicios WHERE estado = 1";
    const { rows } = await pool.query(query);
    return rows;
  },

  getDoctoresByServicio: async (idservicio) => {
    const query = `
      SELECT 
        u.idusuario, 
        u.nombre_completo, 
        e.nombre AS especialidad 
      FROM usuarios u
      INNER JOIN doctor_especialidad de ON u.idusuario = de.iddoctor
      INNER JOIN especialidades e ON de.idespecialidad = e.idespecialidad
      INNER JOIN servicios s ON e.idespecialidad = s.idespecialidad
      WHERE s.idservicio = $1
    `;
    const { rows } = await pool.query(query, [idservicio]);
    return rows;
  },

  getHorariosDisponibles: async (iddoctor, fecha) => {
    const query = `
      SELECT hora 
      FROM citas 
      WHERE iddoctor = $1 AND fecha = $2 AND estado = 0
    `;
    const { rows } = await pool.query(query, [iddoctor, fecha]);

    const horariosOcupados = rows.map((row) => row.hora.slice(0, 5));

    const horariosDisponibles = HORARIOS.filter(
      (hora) => !horariosOcupados.includes(hora)
    );

    return horariosDisponibles;
  },

  verificarCitaExistente: async (idpaciente, iddoctor, fecha) => {
    const query = `
      SELECT COUNT(*) as count 
      FROM citas 
      WHERE idpaciente = $1 
      AND iddoctor = $2 
      AND fecha = $3 
      AND estado = 0
    `;
    const { rows } = await pool.query(query, [idpaciente, iddoctor, fecha]);
    return parseInt(rows[0].count) > 0;
  },

  /**
   * Agenda una nueva cita.
   *
   * El número de ficha (numero_llegada) se calcula en base a la HORA elegida:
   *   07:00 -> 1, 07:15 -> 2, ..., 20:00 -> 53.
   *
   * Usa un advisory lock por fecha para serializar agendamientos concurrentes
   * y evitar que dos personas obtengan la misma ficha para la misma hora.
   */
  agendarCita: async (citaData) => {
    const { idpaciente, iddoctor, idservicio, fecha, hora } = citaData;

    console.log("🩺 agendarCita -> datos:", {
      idpaciente,
      iddoctor,
      idservicio,
      fecha,
      hora,
    });

    const citaExistente = await CitaService.verificarCitaExistente(
      idpaciente,
      iddoctor,
      fecha
    );

    if (citaExistente) {
      throw new Error(
        "El paciente ya tiene una cita agendada con este doctor para hoy"
      );
    }

    // Calcular número de ficha según la hora
    const numeroLlegada = getNumeroLlegadaPorHora(hora);
    if (numeroLlegada === null) {
      throw new Error(
        "Hora no válida. Debe estar entre 07:00 y 20:00 en intervalos de 15 minutos"
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Advisory lock por fecha para serializar agendamientos concurrentes
      await client.query(
        `SELECT pg_advisory_xact_lock(hashtext($1::text))`,
        [fecha]
      );

      // Verificar que no exista ya una cita con la misma hora (misma ficha)
      const existeNumero = await client.query(
        `SELECT 1 FROM citas WHERE fecha = $1 AND numero_llegada = $2 LIMIT 1`,
        [fecha, numeroLlegada]
      );
      if (existeNumero.rowCount > 0) {
        throw new Error(
          `Ya existe una cita agendada para las ${hora} (ficha ${numeroLlegada})`
        );
      }

      const insertCitaQuery = `
        INSERT INTO citas (idpaciente, iddoctor, fecha, hora, estado, numero_llegada)
        VALUES ($1, $2, $3, $4, 0, $5)
        RETURNING *
      `;
      const { rows } = await client.query(insertCitaQuery, [
        idpaciente,
        iddoctor,
        fecha,
        hora,
        numeroLlegada,
      ]);

      const nuevaCita = rows[0];
      console.log("✅ Cita insertada:", nuevaCita);

      const insertServicioQuery = `
        INSERT INTO cita_servicio (idcita, idservicio)
        VALUES ($1, $2)
      `;
      await client.query(insertServicioQuery, [nuevaCita.idcita, idservicio]);

      await client.query("COMMIT");

      return nuevaCita;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Error en transacción agendarCita:", err);
      throw err;
    } finally { 
      client.release();
    }
  },

  insertPacienteDoctor: async (idpaciente, iddoctor) => {
    const query = `
      INSERT INTO paciente_doctor (idpaciente, iddoctor)
      SELECT $1, $2
      WHERE NOT EXISTS (
        SELECT 1 FROM paciente_doctor WHERE idpaciente = $1 AND iddoctor = $2
      )
      RETURNING *
    `;
    const { rows } = await pool.query(query, [idpaciente, iddoctor]);
    return rows[0];
  },
   getDoctoresByEspecialidad: async (req, res) => {
    try {
      const { idespecialidad } = req.params;
      const doctores = await CitaService.getDoctoresByEspecialidad(idespecialidad);
      res.json(doctores);
    } catch (error) {
      console.error("❌ getDoctoresByEspecialidad:", error);
      res.status(500).json({ message: error.message });
    }
  },
};
module.exports = CitaService;