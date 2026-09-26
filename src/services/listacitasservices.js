const { pool } = require("../../db");

const getCitas = async () => {
  const query = `
    SELECT 
      c.idcita, 
      p.nombre_completo AS paciente, 
      u.nombre_completo AS doctor, 
      c.fecha, 
      c.hora, 
      p.telefono, 
      s.nombre AS servicio, 
      s.precio, 
      c.estado,
      c.numero_llegada
    FROM citas c
    JOIN pacientes p ON c.idpaciente = p.idpaciente
    JOIN usuarios u ON c.iddoctor = u.idusuario
    JOIN cita_servicio cs ON c.idcita = cs.idcita
    JOIN servicios s ON cs.idservicio = s.idservicio
    WHERE c.estado IN (0, 1, 4)
    ORDER BY c.fecha ASC, c.numero_llegada ASC NULLS LAST, c.hora ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getCitasHistorial = async (
  fechaInicio,
  fechaFin,
  servicios,
  tipoReporte,
  estados
) => {
  let query = `
    SELECT 
      c.idcita, 
      p.nombre_completo AS paciente, 
      u.nombre_completo AS doctor, 
      c.fecha, 
      c.hora, 
      p.telefono, 
      s.nombre AS servicio, 
      s.precio, 
      c.estado,
      c.numero_llegada
    FROM citas c
    JOIN pacientes p ON c.idpaciente = p.idpaciente
    JOIN usuarios u ON c.iddoctor = u.idusuario
    JOIN cita_servicio cs ON c.idcita = cs.idcita
    JOIN servicios s ON cs.idservicio = s.idservicio
    WHERE c.fecha BETWEEN $1 AND $2
  `;

  const params = [fechaInicio, fechaFin];
  let paramIndex = 3;

  if (servicios && servicios.length > 0) {
    const serviciosArray = servicios.split(",").map((s) => parseInt(s));
    query += ` AND s.idservicio = ANY($${paramIndex})`;
    params.push(serviciosArray);
    paramIndex++;
  }

  if (tipoReporte === "completadas") {
    query += ` AND c.estado = 2`;
  } else if (tipoReporte === "canceladas") {
    query += ` AND c.estado = 3`;
  }

  if (estados && estados.length > 0) {
    const estadosMap = {
      pendiente: 0,
      "en consulta": 1,
      completada: 2,
      cancelada: 3,
      "En sala": 4,
    };
    const estadosNumericos = estados.split(",").map((e) => estadosMap[e]);
    query += ` AND c.estado = ANY($${paramIndex})`;
    params.push(estadosNumericos);
  }

  query += ` ORDER BY c.fecha DESC, c.hora DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

const getServicios = async () => {
  const query = `
    SELECT idservicio, nombre, precio
    FROM servicios
    WHERE estado = 1
    ORDER BY nombre;
  `;
  const result = await pool.query(query);
  return result.rows;
};

const updateEstadoCita = async (id, estado) => {
  const query = `
    UPDATE citas
    SET estado = $1
    WHERE idcita = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [estado, id]);
  return result.rows[0];
};

const deleteCita = async (id) => {
  // Actualizar estado a cancelado (3) en lugar de eliminar
  const query = `
    UPDATE citas
    SET estado = 3
    WHERE idcita = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const procesarPago = async (id, metodoPago) => {
  const citaQuery = `
    SELECT c.idcita, s.precio
    FROM citas c
    JOIN cita_servicio cs ON c.idcita = cs.idcita
    JOIN servicios s ON cs.idservicio = s.idservicio
    WHERE c.idcita = $1
  `;
  const citaResult = await pool.query(citaQuery, [id]);

  if (citaResult.rows.length === 0) {
    throw new Error("Cita no encontrada");
  }

  const { precio } = citaResult.rows[0];

  const pagoQuery = `
    INSERT INTO pagos (idcita, monto, metodo_pago, estado)
    VALUES ($1, $2, $3, 1)
    RETURNING *;
  `;
  const pagoResult = await pool.query(pagoQuery, [id, precio, metodoPago]);

  await pool.query("UPDATE citas SET estado = 2 WHERE idcita = $1", [id]);

  return pagoResult.rows[0];
};

/**
 * Reordena las citas de un mismo día.
 * Recibe: orden = [{ idcita, numeroLlegada }, ...]
 *
 * Estrategia:
 *  - Se agrupa por fecha (cada cita pertenece a una fecha).
 *  - Para evitar colisiones si en el futuro se añadiera un UNIQUE(fecha, numero_llegada),
 *    se hace en dos pasos dentro de una transacción:
 *      1) UPDATE con numero_llegada negativo (temporal).
 *      2) UPDATE con el numero_llegada final.
 */
const reordenarCitas = async (orden) => {
  if (!Array.isArray(orden) || orden.length === 0) {
    throw new Error("El orden proporcionado está vacío");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Obtener fecha de cada cita (deben ser todas del mismo día para reordenar)
    const ids = orden.map((o) => o.idcita);
    const fechasResult = await client.query(
      `SELECT idcita, fecha FROM citas WHERE idcita = ANY($1)`,
      [ids]
    );

    const fechas = new Set(
      fechasResult.rows.map((r) => r.fecha.toISOString().split("T")[0])
    );

    if (fechas.size > 1) {
      throw new Error(
        "No se pueden reordenar citas de fechas distintas en una sola operación"
      );
    }

    // Paso 1: mover a números temporales negativos para liberar los actuales
    for (let i = 0; i < orden.length; i++) {
      await client.query(
        `UPDATE citas SET numero_llegada = $1 WHERE idcita = $2`,
        [-(i + 1), orden[i].idcita]
      );
    }

    // Paso 2: asignar los números finales
    for (const item of orden) {
      await client.query(
        `UPDATE citas SET numero_llegada = $1 WHERE idcita = $2`,
        [item.numeroLlegada, item.idcita]
      );
    }

    await client.query("COMMIT");

    // Devolver las citas actualizadas
    const result = await pool.query(
      `SELECT idcita, numero_llegada FROM citas WHERE idcita = ANY($1)`,
      [ids]
    );
    return result.rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getCitas,
  getCitasHistorial,
  getServicios,
  updateEstadoCita,
  deleteCita,
  procesarPago,
  reordenarCitas,
};