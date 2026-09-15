const { login } = require("../services/authservices");
const jwt = require("jsonwebtoken");

const loginController = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos" });
  }

  try {
    const user = await login(username, password);

    // Verificar si el usuario está activo (estado = 1)
    if (user.estado !== 1) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: el usuario no está activo." });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { 
        id: user.idusuario,
        username: user.usuario,
        role: user.rol 
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: "8h",
      }
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.idusuario,
        name: user.nombre_completo,
        role: user.rol,
        email: user.correo,
        phone: user.telefono,
        username: user.usuario
      },
      token,
      expiresIn: "8h"
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(401).json({ message: error.message });
  }
};

// Controlador para verificar token
const verifyTokenController = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

module.exports = { 
  loginController, 
  verifyTokenController 
};