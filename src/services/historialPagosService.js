const { pool } = require("../../db");

module.exports = {
  getHistorialPagos: async (filtros) => {
    const { busqueda, fechaInicio, fechaFin, iddoctor, pagina = 1, exportar = false } = filtros;
    const values = [];
    let where = "WHERE p.estado = 1";
    if (busqueda) {
      values.push(`%${busqueda}%`);
      const param = `$${values.length}`;
      where += ` AND (pa.nombre_completo ILIKE ${param} OR u.nombre_completo ILIKE ${param} OR p.monto::text ILIKE ${param} OR EXISTS (SELECT 1 FROM cita_servicio cs JOIN servicios s ON s.idservicio = cs.idservicio WHERE cs.idcita = c.idcita AND s.nombre ILIKE ${param}))`;
    }
    if (iddoctor) { values.push(iddoctor); where += ` AND c.iddoctor = $${values.length}`; }
    if (fechaInicio) { values.push(fechaInicio); where += ` AND p.fecha >= $${values.length}::date`; }
    if (fechaFin) { values.push(fechaFin); where += ` AND p.fecha < ($${values.length}::date + INTERVAL '1 day')`; }
    const base = `FROM pagos p
      JOIN citas c ON c.idcita = p.idcita
      JOIN pacientes pa ON pa.idpaciente = c.idpaciente
      JOIN usuarios u ON u.idusuario = c.iddoctor
      ${where}`;
    const detalle = `SELECT p.idpago, pa.nombre_completo AS paciente,
      u.nombre_completo AS doctor, p.fecha,
      ARRAY(SELECT s.nombre FROM cita_servicio cs JOIN servicios s ON s.idservicio = cs.idservicio WHERE cs.idcita = c.idcita ORDER BY s.idservicio) AS concepto,
      p.monto, p.metodo_pago ${base} ORDER BY p.fecha DESC, p.idpago DESC`;
    const client = await pool.connect();
    try {
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const { rows: [totales] } = await client.query(`SELECT COUNT(*) AS total,
        COALESCE(SUM(p.monto), 0) AS recaudado,
        COALESCE(SUM(p.monto) FILTER (WHERE LOWER(TRIM(p.metodo_pago)) = 'efectivo'), 0) AS efectivo,
        COALESCE(SUM(p.monto) FILTER (WHERE LOWER(TRIM(p.metodo_pago)) = 'qr'), 0) AS qr ${base}`, values);
      const total = Number(totales.total);
      const totalPaginas = Math.max(1, Math.ceil(total / 30));
      const paginaActual = Math.min(pagina, totalPaginas);
      const { rows: pagos } = await client.query(exportar ? detalle : `${detalle} LIMIT 30 OFFSET $${values.length + 1}`, exportar ? values : [...values, (paginaActual - 1) * 30]);
      await client.query("COMMIT");
      return { pagos, total, pagina: paginaActual, totalPaginas, totales: { recaudado: totales.recaudado, efectivo: totales.efectivo, qr: totales.qr } };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally { client.release(); }
  },
  getDoctores: async () => {
    const { rows } = await pool.query(`SELECT idusuario, nombre_completo FROM usuarios WHERE rol = 1 AND estado = 1 ORDER BY nombre_completo ASC`);
    return rows;
  },
};