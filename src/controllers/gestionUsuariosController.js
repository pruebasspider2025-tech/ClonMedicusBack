const gestionUsuariosService = require("../services/gestionUsuarioservice");

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await gestionUsuariosService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las especialidades
const getEspecialidades = async (req, res) => {
  try {
    const especialidades = await gestionUsuariosService.getEspecialidades();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const newUser = await gestionUsuariosService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un usuario existente
const updateUser = async (req, res) => {
  try {
    const updatedUser = await gestionUsuariosService.updateUser(
      req.params.id,
      req.body
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar la contraseña de un usuario
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: "La nueva contraseña es requerida" });
    }
    
    const result = await gestionUsuariosService.updateUserPassword(id, newPassword);
    res.json({ 
      message: "Contraseña actualizada exitosamente",
      user: result 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar el estado de un usuario
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await gestionUsuariosService.updateUserStatus(id, estado);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getEspecialidades,
  createUser,
  updateUser,
  updateUserPassword,
  updateUserStatus,
};