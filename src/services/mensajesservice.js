// src/services/mensajesservice.js
const { pool } = require("../../db");

/**
 * Mapea rol numérico a string legible.
 */
const mapRol = (rol) => {
  switch (rol) {
    case 0:
      return "Secretaria";
    case 1:
      return "Doctor";
    case 2:
      return "Administrador";
    default:
      return "Usuario";
  }
};

/**
 * Devuelve la lista de contactos (todos los usuarios activos menos yo).
 * Incluye conteo de no leídos por contacto.
 */
const getContactos = async (userId) => {
  const query = `
    SELECT
      u.idusuario,
      u.nombre_completo,
      u.rol,
      u.en_linea,
      COALESCE(nl.no_leidos, 0) AS no_leidos
    FROM usuarios u
    LEFT JOIN (
      SELECT
        CASE
          WHEN c.idusuario1 = $1 THEN c.idusuario2
          ELSE c.idusuario1
        END AS otro_usuario,
        COUNT(m.idmensaje) AS no_leidos
      FROM conversaciones c
      INNER JOIN mensajes m
        ON m.idconversacion = c.idconversacion
       AND m.idemisor <> $1
       AND m.leido = false
      WHERE c.idusuario1 = $1 OR c.idusuario2 = $1
      GROUP BY otro_usuario
    ) nl ON nl.otro_usuario = u.idusuario
    WHERE u.idusuario <> $1
      AND u.estado = 1
    ORDER BY u.nombre_completo ASC
  `;
  const result = await pool.query(query, [userId]);

  return result.rows.map((r) => ({
    id: r.idusuario,
    nombre: r.nombre_completo,
    rol: mapRol(r.rol),
    online: r.en_linea,
    noLeidos: parseInt(r.no_leidos, 10) || 0,
  }));
};

/**
 * Obtiene o crea la conversación entre dos usuarios.
 * Guarda el id menor como idusuario1 para respetar el UNIQUE.
 */
const getOrCreateConversacion = async (userId, otroUserId) => {
  const a = Math.min(userId, otroUserId);
  const b = Math.max(userId, otroUserId);

  const findQuery = `
    SELECT idconversacion
    FROM conversaciones
    WHERE idusuario1 = $1 AND idusuario2 = $2
  `;
  const found = await pool.query(findQuery, [a, b]);
  if (found.rows[0]) return found.rows[0].idconversacion;

  const insertQuery = `
    INSERT INTO conversaciones (idusuario1, idusuario2)
    VALUES ($1, $2)
    RETURNING idconversacion
  `;
  const created = await pool.query(insertQuery, [a, b]);
  return created.rows[0].idconversacion;
};

/**
 * Devuelve todos los mensajes entre yo y otro usuario.
 */
const getMensajes = async (userId, otroUserId) => {
  const idconversacion = await getOrCreateConversacion(userId, otroUserId);

  const query = `
    SELECT
      idmensaje,
      idconversacion,
      idemisor,
      contenido,
      fecha,
      leido,
      fecha_leido
    FROM mensajes
    WHERE idconversacion = $1
    ORDER BY fecha ASC
  `;
  const result = await pool.query(query, [idconversacion]);

  return result.rows.map((m) => ({
    id: m.idmensaje,
    conversacionId: m.idconversacion,
    texto: m.contenido,
    emisor: m.idemisor === userId ? "yo" : "contacto",
    emisorId: m.idemisor,
    fecha: m.fecha,
    leido: m.leido,
    fechaLeido: m.fecha_leido,
  }));
};

/**
 * Inserta un mensaje.
 */
const enviarMensaje = async (userId, otroUserId, texto) => {
  const idconversacion = await getOrCreateConversacion(userId, otroUserId);

  const query = `
    INSERT INTO mensajes (idconversacion, idemisor, contenido)
    VALUES ($1, $2, $3)
    RETURNING idmensaje, idconversacion, idemisor, contenido, fecha, leido, fecha_leido
  `;
  const result = await pool.query(query, [idconversacion, userId, texto]);
  const m = result.rows[0];

  return {
    id: m.idmensaje,
    conversacionId: m.idconversacion,
    texto: m.contenido,
    emisor: "yo",
    emisorId: m.idemisor,
    fecha: m.fecha,
    leido: m.leido,
    fechaLeido: m.fecha_leido,
  };
};

/**
 * Marca como leídos los mensajes del otro usuario hacia mí.
 */
const marcarComoLeidos = async (userId, otroUserId) => {
  const a = Math.min(userId, otroUserId);
  const b = Math.max(userId, otroUserId);

  const query = `
    UPDATE mensajes m
    SET leido = true,
        fecha_leido = NOW()
    FROM conversaciones c
    WHERE m.idconversacion = c.idconversacion
      AND c.idusuario1 = $1
      AND c.idusuario2 = $2
      AND m.idemisor <> $3
      AND m.leido = false
  `;
  await pool.query(query, [a, b, userId]);
  return true;
};

/**
 * Conteo de no leídos por contacto.
 */
const getNoLeidosPorContacto = async (userId) => {
  const query = `
    SELECT
      CASE
        WHEN c.idusuario1 = $1 THEN c.idusuario2
        ELSE c.idusuario1
      END AS otro_usuario,
      COUNT(m.idmensaje) AS no_leidos
    FROM conversaciones c
    INNER JOIN mensajes m
      ON m.idconversacion = c.idconversacion
     AND m.idemisor <> $1
     AND m.leido = false
    WHERE c.idusuario1 = $1 OR c.idusuario2 = $1
    GROUP BY otro_usuario
  `;
  const result = await pool.query(query, [userId]);

  const conteo = {};
  result.rows.forEach((r) => {
    conteo[r.otro_usuario] = parseInt(r.no_leidos, 10);
  });
  return conteo;
};

/**
 * Total de mensajes no leídos.
 */
const getTotalNoLeidos = async (userId) => {
  const query = `
    SELECT COUNT(m.idmensaje) AS total
    FROM conversaciones c
    INNER JOIN mensajes m
      ON m.idconversacion = c.idconversacion
     AND m.idemisor <> $1
     AND m.leido = false
    WHERE c.idusuario1 = $1 OR c.idusuario2 = $1
  `;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].total, 10) || 0;
};

module.exports = {
  getContactos,
  getOrCreateConversacion,
  getMensajes,
  enviarMensaje,
  marcarComoLeidos,
  getNoLeidosPorContacto,
  getTotalNoLeidos,
};