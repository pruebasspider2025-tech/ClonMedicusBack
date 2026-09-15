const { pool } = require("../../db");

const getTransacciones = async () => {
  const query = `
    SELECT 
      pa.idpago, 
      c.idpaciente,
      p.nombre_completo AS paciente, 
      pa.fecha, 
      pa.monto, 
      array_agg(s.nombre) AS concepto,
      pa.estado,
      pa.metodo_pago AS metodoPago
    FROM pagos pa
    JOIN citas c ON pa.idcita = c.idcita
    JOIN pacientes p ON c.idpaciente = p.idpaciente
    JOIN cita_servicio cs ON c.idcita = cs.idcita
    JOIN servicios s ON cs.idservicio = s.idservicio
    WHERE pa.estado = 0
    GROUP BY pa.idpago, c.idpaciente, p.nombre_completo, pa.fecha, pa.monto, pa.estado, pa.metodo_pago
  `;
  const result = await pool.query(query);
  return result.rows;
};

const updateTransaccion = async (id, metodoPago, userId, monto) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const metodoPagoFormateado =
      metodoPago === "EFECTIVO" ? "Efectivo" : metodoPago;

    const updatePagoQuery = `
      UPDATE pagos
      SET 
        metodo_pago = $1,
        estado = 1,
        monto = $2
      WHERE idpago = $3
      RETURNING *;
    `;
    const pagoResult = await client.query(updatePagoQuery, [
      metodoPagoFormateado,
      monto,
      id,
    ]);

    if (metodoPago.toLowerCase() === "efectivo") {
      const ultimaCajaQuery = `
        SELECT * FROM caja
        ORDER BY idcaja DESC
        LIMIT 1;
      `;
      const ultimaCajaResult = await client.query(ultimaCajaQuery);
      const ultimaCaja = ultimaCajaResult.rows[0];

      const montoApertura = ultimaCaja
        ? parseFloat(ultimaCaja.monto_cierre) * 100
        : 0;
      const montoPago = parseFloat(monto) * 100;

      const montoCierreEntero = montoApertura + montoPago;
      const montoCierre = (montoCierreEntero / 100).toFixed(2);

      const insertCajaQuery = `
        INSERT INTO caja (monto_apertura, monto_cierre, fecha)
        VALUES ($1, $2, CURRENT_DATE AT TIME ZONE 'America/La_Paz')
        RETURNING idcaja;
      `;
      const cajaResult = await client.query(insertCajaQuery, [
        (montoApertura / 100).toFixed(2),
        montoCierre,
      ]);
      const idCaja = cajaResult.rows[0].idcaja;

      const insertMovimientoQuery = `
        INSERT INTO movimiento_caja (
          idcaja, tipo_movimiento, monto, concepto, justificacion, idpago, idempleado
        )
        VALUES ($1, 1, $2, 'Ingreso por pago de cita', 'Pago del servicio', $3, $4);
      `;
      await client.query(insertMovimientoQuery, [
        idCaja,
        monto,
        id,
        userId,
      ]);
    }

    await client.query("COMMIT");
    return pagoResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getTransacciones,
  updateTransaccion,
};