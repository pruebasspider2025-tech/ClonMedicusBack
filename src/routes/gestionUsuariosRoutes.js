const express = require("express");
const gestionUsuariosController = require("../controllers/gestionUsuariosController");
const router = express.Router();

// Rutas para usuarios
router.get("/users", gestionUsuariosController.getUsers);
router.post("/users", gestionUsuariosController.createUser);
router.put("/users/:id", gestionUsuariosController.updateUser);
router.patch("/users/:id/password", gestionUsuariosController.updateUserPassword);
router.patch("/users/:id/status", gestionUsuariosController.updateUserStatus);

// Ruta para obtener especialidades
router.get("/especialidades", gestionUsuariosController.getEspecialidades);

module.exports = router;