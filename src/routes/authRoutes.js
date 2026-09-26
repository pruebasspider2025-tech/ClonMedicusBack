// src/routes/authRoutes.js
const express = require("express");
const {
  loginController,
  verifyTokenController,
  logoutController,
} = require("../controllers/authController");
const {
  authenticateToken,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginController);
router.get("/verify", authenticateToken, verifyTokenController);
router.post("/logout", authenticateToken, logoutController);

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Perfil del usuario",
    user: req.user,
  });
});

router.get("/admin", authenticateToken, authorize([2]), (req, res) => {
  res.json({
    message: "Panel de administración",
    user: req.user,
  });
});

router.get("/medical", authenticateToken, authorize([1, 2]), (req, res) => {
  res.json({
    message: "Panel médico",
    user: req.user,
  });
});

module.exports = router;