const express = require("express");
const { 
  loginController, 
  verifyTokenController 
} = require("../controllers/authController");
const { 
  authenticateToken, 
  authorize 
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginController);
router.get("/verify", authenticateToken, verifyTokenController);

// Ruta protegida de ejemplo
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Perfil del usuario",
    user: req.user
  });
});

// Ruta solo para administradores
router.get("/admin", authenticateToken, authorize([2]), (req, res) => {
  res.json({
    message: "Panel de administración",
    user: req.user
  });
});

// Ruta para doctores y administradores
router.get("/medical", authenticateToken, authorize([1, 2]), (req, res) => {
  res.json({
    message: "Panel médico",
    user: req.user
  });
});

module.exports = router;