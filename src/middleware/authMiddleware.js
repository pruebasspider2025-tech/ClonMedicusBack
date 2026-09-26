// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token de autorización requerido" });
  }

  // Soporte para "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expirado" });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Token inválido" });
      } else {
        return res
          .status(403)
          .json({ message: "Error al verificar token" });
      }
    }

    /**
     * Normalizamos el payload para garantizar que SIEMPRE exista
     * `req.user.id`. El token se firma en authController con:
     *   { id, username, role }
     */
    req.user = {
      id: decoded.id ?? decoded.idusuario ?? null,
      username: decoded.username ?? decoded.usuario ?? null,
      role: decoded.role ?? decoded.rol ?? null,
      _raw: decoded,
    };

    next();
  });
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tiene permisos para realizar esta acción",
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
};