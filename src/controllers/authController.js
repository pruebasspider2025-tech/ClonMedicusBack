// src/controllers/authController.js
const { login, setEnLinea } = require("../services/authservices");
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

    if (user.estado !== 1) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: el usuario no está activo." });
    }

    // ── Marcar como en línea ──
    await setEnLinea(user.idusuario, true);

    const token = jwt.sign(
      {
        id: user.idusuario,
        username: user.usuario,
        role: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.idusuario,
        name: user.nombre_completo,
        role: user.rol,
        email: user.correo,
        phone: user.telefono,
        username: user.usuario,
        enLinea: true,
      },
      token,
      expiresIn: "8h",
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(401).json({ message: error.message });
  }
};

const verifyTokenController = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// ─────────────────────────────────────────────
// NUEVO: logout → en_linea = false
// ─────────────────────────────────────────────
const logoutController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.idusuario;
    if (userId) {
      await setEnLinea(userId, false);
    }
    res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

module.exports = {
  loginController,
  verifyTokenController,
  logoutController,
};