const { pool } = require("../../db");

module.exports = {
  getHistorialPagos: async (filtros) => {
    const { busqueda, fechaInicio, fechaFin, iddoctor } = filtros;
    let query = `
            SELECT 
                p.idpago,
                pa.nombre_completo AS paciente,
                u.nombre_completo AS doctor,
                p.fecha,
                array_agg(s.nombre) AS concepto,
                p.monto,
                p.metodo_pago
            FROM pagos p
            INNER JOIN citas c ON p.idcita = c.idcita
            INNER JOIN pacientes pa ON c.idpaciente = pa.idpaciente
            INNER JOIN cita_servicio cs ON c.idcita = cs.idcita
	          INNER JOIN servicios s ON cs.idservicio = s.idservicio
            INNER JOIN usuarios u ON c.iddoctor = u.idusuario
            WHERE 1=1 AND p.estado = 1
        `;
    const values = [];

    if (busqueda) {
      query += ` AND (pa.nombre_completo ILIKE $${
        values.length + 1
      } OR s.nombre ILIKE $${values.length + 1})`;
      values.push(`%${busqueda}%`);
    }

    if (iddoctor) {
      query += ` AND c.iddoctor = $${values.length + 1}`;
      values.push(iddoctor);
    }

    if (fechaInicio) {
      query += ` AND p.fecha >= $${values.length + 1}`;
      values.push(fechaInicio);
    }

    if (fechaFin) {
      const fechaFinAjustada = new Date(fechaFin);
      fechaFinAjustada.setDate(fechaFinAjustada.getDate() + 1);
      query += ` AND p.fecha < $${values.length + 1}`;
      values.push(fechaFinAjustada.toISOString().split("T")[0]);
    }

    query += `GROUP BY p.idpago, pa.nombre_completo, u.nombre_completo, p.fecha, p.monto, p.metodo_pago ORDER BY p.fecha DESC`;

    const { rows } = await pool.query(query, values);
    return rows;
  },

  getDoctores: async () => {
    const query = `
      SELECT idusuario, nombre_completo 
      FROM usuarios 
      WHERE rol = 1 AND estado = 1
      ORDER BY nombre_completo ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },
};
