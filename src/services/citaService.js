const { pool } = require("../../db");

const CitaService = {
  getPacientes: async (searchTerm = "") => {
    const query = `
    SELECT * FROM pacientes 
    WHERE estado = 0 
    AND (
      nombre_completo ILIKE $1 OR 
      ci ILIKE $1
    )
    LIMIT 5
  `;
    const { rows } = await pool.query(query, [`%${searchTerm}%`]);
    return rows;
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
FROM 
    usuarios u
INNER JOIN 
    doctor_especialidad de ON u.idusuario = de.iddoctor
INNER JOIN 
    especialidades e ON de.idespecialidad = e.idespecialidad
INNER JOIN 
    servicios s ON e.idespecialidad = s.idespecialidad
WHERE 
    s.idservicio = $1
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

    const todosHorarios = [
      "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45",
      "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45",
      "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45",
      "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45",
      "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45",
      "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45",
      "19:00", "19:15", "19:30", "19:45", "20:00",
    ];

    const horariosDisponibles = todosHorarios.filter(
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

  agendarCita: async (citaData) => {
    const { idpaciente, iddoctor, idservicio, fecha, hora } = citaData;

    const citaExistente = await CitaService.verificarCitaExistente(idpaciente, iddoctor, fecha);

    if (citaExistente) {
      throw new Error("El paciente ya tiene una cita agendada con este doctor para hoy");
    }

    const query = `
      INSERT INTO citas (idpaciente, iddoctor, fecha, hora, estado) 
      VALUES ($1, $2, $3, $4, 0) 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      idpaciente,
      iddoctor,
      fecha,
      hora,
    ]);

    const nuevaCita = rows[0];

    const queryServicio = `
        INSERT INTO cita_servicio (idcita, idservicio) 
        VALUES ($1, $2)
      `;
    await pool.query(queryServicio, [nuevaCita.idcita, idservicio]);

    return nuevaCita;
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
};

module.exports = CitaService;