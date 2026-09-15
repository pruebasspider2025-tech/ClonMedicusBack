const { pool } = require("../../db");
const bcrypt = require("bcrypt");

const login = async (username, password) => {
  const query = `
    SELECT 
      idusuario,
      usuario,
      contrasenia,
      nombre_completo,
      rol,
      estado,
      telefono,
      correo,
      fecha_registro
    FROM usuarios 
    WHERE usuario = $1
  `;
  const values = [username];

  try {
    const result = await pool.query(query, values);
    const user = result.rows[0];

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar si la contraseña está hasheada
    const isHashed = user.contrasenia.startsWith('$2b$');
    
    let passwordMatch = false;
    
    if (isHashed) {
      // Comparar con bcrypt para contraseñas hasheadas
      passwordMatch = await bcrypt.compare(password, user.contrasenia);
    } else {
      // Comparación directa para migración (eliminar después)
      passwordMatch = password === user.contrasenia;
      
      // Si coincide y no está hasheada, actualizar a hash
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          "UPDATE usuarios SET contrasenia = $1 WHERE idusuario = $2",
          [hashedPassword, user.idusuario]
        );
        console.log(`Contraseña hasheada para usuario: ${user.usuario}`);
      }
    }

    if (!passwordMatch) {
      throw new Error("Contraseña incorrecta");
    }

    // Eliminar la contraseña del objeto de usuario antes de devolverlo
    const { contrasenia, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Función para crear usuario con contraseña hasheada
const createUser = async (userData) => {
  const {
    nombre_completo,
    telefono,
    correo,
    usuario,
    contrasenia,
    rol,
    estado = 1
  } = userData;

  const hashedPassword = await bcrypt.hash(contrasenia, 10);

  const query = `
    INSERT INTO usuarios (
      nombre_completo, telefono, correo, usuario, contrasenia, rol, estado
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING idusuario, usuario, nombre_completo, rol, estado, telefono, correo, fecha_registro
  `;

  const values = [
    nombre_completo,
    telefono,
    correo,
    usuario,
    hashedPassword,
    rol,
    estado
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
};

// Función para actualizar contraseña
const updatePassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const query = `
    UPDATE usuarios 
    SET contrasenia = $1 
    WHERE idusuario = $2
  `;
  
  const values = [hashedPassword, userId];
  
  try {
    await pool.query(query, values);
    return true;
  } catch (error) {
    throw new Error(`Error al actualizar contraseña: ${error.message}`);
  }
};

module.exports = { 
  login, 
  createUser, 
  updatePassword 
};