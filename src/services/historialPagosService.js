const { pool } = require("../../db");
module.exports = {
  getHistorialPagos: async ({busqueda, periodo = "hoy", fechaInicio, fechaFin, anio, iddoctor, pagina = 1, exportar = false}) => {
    const values = [];
    let where = "WHERE p.estado = 1";
    const client = await pool.connect();
    try {
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      let inicio = null, fin = null;
      if (busqueda) {
        values.push(`%${busqueda}%`);
        const param = `$${values.length}`;
        where += ` AND (pa.nombre_completo ILIKE ${param} OR pa.ci ILIKE ${param} OR u.nombre_completo ILIKE ${param} OR p.monto::text ILIKE ${param} OR EXISTS (SELECT 1 FROM cita_servicio cs JOIN servicios s ON s.idservicio = cs.idservicio WHERE cs.idcita = c.idcita AND s.nombre ILIKE ${param}))`;
      } else {
        const hoy = "(CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz')::date";
        const limites = {
          hoy: [hoy,hoy], ayer: [`${hoy} - 1`,`${hoy} - 1`],
          semana: [`date_trunc('week', ${hoy}::timestamp)::date`, `date_trunc('week', ${hoy}::timestamp)::date + 6`],
          mes: [`date_trunc('month', ${hoy}::timestamp)::date`, `(date_trunc('month', ${hoy}::timestamp) + interval '1 month - 1 day')::date`],
          mes_pasado: [`(date_trunc('month', ${hoy}::timestamp) - interval '1 month')::date`, `date_trunc('month', ${hoy}::timestamp)::date - 1`]
        };
        if (periodo === "fecha") inicio = fin = fechaInicio;
        else if (periodo === "rango") { inicio = fechaInicio; fin = fechaFin; }
        else if (periodo === "anio") { inicio = `${anio}-01-01`; fin = `${anio}-12-31`; }
        else {
          const [a,b] = limites[periodo];
          const {rows:[r]} = await client.query(`SELECT to_char((${a})::date,'YYYY-MM-DD') AS inicio, to_char((${b})::date,'YYYY-MM-DD') AS fin`);
          inicio = r.inicio; fin = r.fin;
        }
        values.push(inicio,fin);
        where += ` AND p.fecha >= $${values.length-1}::date AND p.fecha < ($${values.length}::date + INTERVAL '1 day')`;
      }
      if (iddoctor) { values.push(iddoctor); where += ` AND c.iddoctor = $${values.length}`; }
      const base = `FROM pagos p JOIN citas c ON c.idcita = p.idcita JOIN pacientes pa ON pa.idpaciente = c.idpaciente JOIN usuarios u ON u.idusuario = c.iddoctor ${where}`;
      const detalle = `SELECT p.idpago, pa.nombre_completo AS paciente, u.nombre_completo AS doctor, to_char(p.fecha, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha, ARRAY(SELECT s.nombre FROM cita_servicio cs JOIN servicios s ON s.idservicio = cs.idservicio WHERE cs.idcita = c.idcita ORDER BY s.idservicio) AS concepto, p.monto, p.metodo_pago ${base} ORDER BY p.fecha DESC, p.idpago DESC`;
      const {rows:[totales]} = await client.query(`SELECT COUNT(*) AS total, COALESCE(SUM(p.monto),0) AS recaudado, COALESCE(SUM(p.monto) FILTER (WHERE LOWER(TRIM(p.metodo_pago)) = 'efectivo'),0) AS efectivo, COALESCE(SUM(p.monto) FILTER (WHERE LOWER(TRIM(p.metodo_pago)) = 'qr'),0) AS qr ${base}`,values);
      const total = Number(totales.total);
      const totalPaginas = Math.max(1,Math.ceil(total/30));
      const paginaActual = Math.min(pagina,totalPaginas);
      const {rows:pagos} = await client.query(exportar ? detalle : `${detalle} LIMIT 30 OFFSET $${values.length+1}`,exportar ? values : [...values,(paginaActual-1)*30]);
      await client.query("COMMIT");
      return {pagos,total,pagina:paginaActual,totalPaginas,fechaInicio:inicio,fechaFin:fin,totales:{recaudado:totales.recaudado,efectivo:totales.efectivo,qr:totales.qr}};
    } catch(err) { await client.query("ROLLBACK"); throw err; }
    finally { client.release(); }
  },
  getDoctores: async () => {
    const {rows} = await pool.query("SELECT idusuario, nombre_completo FROM usuarios WHERE rol = 1 AND estado = 1 ORDER BY nombre_completo ASC");
    return rows;
  }
};
