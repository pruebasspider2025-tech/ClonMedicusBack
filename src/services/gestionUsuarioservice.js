const { pool } = require("../../db");
const bcrypt = require("bcrypt");

// Obtener todos los usuarios
const getUsers = async () => {
  const { rows } = await pool.query(
    "SELECT u.*, array_agg(de.idespecialidad) AS especialidades " +
      "FROM usuarios u " +
      "LEFT JOIN doctor_especialidad de ON u.idusuario = de.iddoctor " +
      "WHERE u.rol != 2 AND u.estado != 3 " +
      "GROUP BY u.idusuario"
  );
  return rows;
};

// Obtener todas las especialidades
const getEspecialidades = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM especialidades WHERE estado = 1"
  );
  return rows;
};

// Crear un nuevo usuario con contraseña hasheada
const createUser = async (user) => {
  const {
    nombre_completo,
    telefono,
    correo,
    usuario,
    password,
    rol,
    estado,
    especialidades,
  } = user;

  // Validar campos requeridos
  if (
    !nombre_completo ||
    !telefono ||
    !correo ||
    !usuario ||
    !password ||
    rol === undefined
  ) {
    throw new Error("Todos los campos son requeridos");
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insertar el usuario en la tabla usuarios
  const { rows } = await pool.query(
    "INSERT INTO usuarios (nombre_completo, telefono, correo, usuario, contrasenia, rol, estado) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [nombre_completo, telefono, correo, usuario, hashedPassword, rol, estado]
  );

  const newUser = rows[0];

  // Si el usuario es un doctor y tiene especialidades, insertar en doctor_especialidad
  if (newUser.rol === 1 && especialidades && especialidades.length > 0) {
    await Promise.all(
      especialidades.map(async (idespecialidad) => {
        await pool.query(
          "INSERT INTO doctor_especialidad (iddoctor, idespecialidad) VALUES ($1, $2)",
          [newUser.idusuario, idespecialidad]
        );
      })
    );
  }

  return newUser;
};

// Actualizar un usuario existente
const updateUser = async (id, user) => {
  const { nombre_completo, telefono, correo, usuario, rol, especialidades } =
    user;

  // Validar campos requeridos
  if (
    !nombre_completo ||
    !telefono ||
    !correo ||
    !usuario ||
    rol === undefined
  ) {
    throw new Error("Todos los campos son requeridos");
  }

  // Actualizar el usuario en la tabla usuarios (sin contraseña)
  const { rows } = await pool.query(
    "UPDATE usuarios SET nombre_completo = $1, telefono = $2, correo = $3, usuario = $4, rol = $5 " +
      "WHERE idusuario = $6 RETURNING *",
    [nombre_completo, telefono, correo, usuario, rol, id]
  );

  const updatedUser = rows[0];

  // Si el usuario es un doctor y tiene especialidades, actualizar doctor_especialidad
  if (updatedUser.rol === 1 && especialidades && especialidades.length > 0) {
    // Eliminar las especialidades existentes
    await pool.query("DELETE FROM doctor_especialidad WHERE iddoctor = $1", [
      updatedUser.idusuario,
    ]);

    // Insertar las nuevas especialidades
    await Promise.all(
      especialidades.map(async (idespecialidad) => {
        await pool.query(
          "INSERT INTO doctor_especialidad (iddoctor, idespecialidad) VALUES ($1, $2)",
          [updatedUser.idusuario, idespecialidad]
        );
      })
    );
  }

  return updatedUser;
};

// Actualizar la contraseña de un usuario
const updateUserPassword = async (id, newPassword) => {
  // Validar longitud de contraseña
  if (!newPassword || newPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { rows } = await pool.query(
    "UPDATE usuarios SET contrasenia = $1 WHERE idusuario = $2 RETURNING idusuario, usuario",
    [hashedPassword, id]
  );
  
  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }
  
  return rows[0];
};

// Actualizar el estado de un usuario
const updateUserStatus = async (id, estado) => {
  const { rows } = await pool.query(
    "UPDATE usuarios SET estado = $1 WHERE idusuario = $2 RETURNING *",
    [estado, id]
  );
  return rows[0];
};

module.exports = {
  getUsers,
  getEspecialidades,
  createUser,
  updateUser,
  updateUserPassword,
  updateUserStatus,
};