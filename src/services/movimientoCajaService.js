const { pool } = require("../../db");

module.exports = {
  getMovimientos: async () => {
    const query = "SELECT * FROM movimiento_caja ORDER BY fecha DESC";
    const { rows } = await pool.query(query);
    return rows;
  },

  addMovimiento: async (movimiento) => {
    const { tipo_movimiento, monto, concepto, justificacion, idempleado } =
      movimiento;

    // Convertir el monto a número
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum)) {
      throw new Error("El monto no es un número válido.");
    }

    // Obtener el último monto_cierre de la caja
    const cajaQuery =
      "SELECT monto_cierre FROM caja ORDER BY idcaja DESC LIMIT 1";
    const cajaResult = await pool.query(cajaQuery);
    const montoApertura = parseFloat(cajaResult.rows[0]?.monto_cierre) || 0;

    // Calcular el nuevo monto_cierre
    const nuevoMontoCierre =
      tipo_movimiento === 1
        ? montoApertura + montoNum // Ingreso
        : montoApertura - montoNum; // Egreso

    // Insertar en la tabla caja
    const cajaInsertQuery = `
      INSERT INTO caja (monto_apertura, monto_cierre, fecha)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING idcaja;
    `;
    const cajaInsertValues = [
      montoApertura.toFixed(2),
      nuevoMontoCierre.toFixed(2),
    ];
    const cajaInsertResult = await pool.query(
      cajaInsertQuery,
      cajaInsertValues
    );
    const idcaja = cajaInsertResult.rows[0].idcaja; // Obtener el idcaja generado

    // Insertar el movimiento en movimiento_caja usando el idcaja obtenido
    const movimientoQuery = `
      INSERT INTO movimiento_caja (idcaja, tipo_movimiento, monto, concepto, justificacion, idempleado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const movimientoValues = [
      idcaja,
      tipo_movimiento,
      montoNum.toFixed(2), // Asegurar que el monto tenga 2 decimales
      concepto,
      justificacion,
      idempleado,
    ];
    const { rows } = await pool.query(movimientoQuery, movimientoValues);

    return rows[0];
  },

  searchMovimientos: async (query) => {
    const searchQuery = `
      SELECT * FROM movimiento_caja
      WHERE concepto ILIKE $1 OR justificacion ILIKE $1
      ORDER BY fecha DESC
    `;
    const { rows } = await pool.query(searchQuery, [`%${query}%`]);
    return rows;
  },

  // Nueva función para obtener el último saldo de la caja
  getUltimoSaldo: async () => {
    const query = "SELECT monto_cierre FROM caja ORDER BY idcaja DESC LIMIT 1";
    const { rows } = await pool.query(query);
    return rows[0] || { monto_cierre: 0 };
  },
};
