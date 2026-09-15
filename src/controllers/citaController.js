const CitaService = require("../services/citaService");

const CitaController = {
  getPacientes: async (req, res) => {
    try {
      const searchTerm = req.query.search || "";
      const pacientes = await CitaService.getPacientes(searchTerm);
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getServicios: async (req, res) => {
    try {
      const servicios = await CitaService.getServicios();
      res.json(servicios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDoctoresByServicio: async (req, res) => {
    try {
      const { idservicio } = req.params;
      const doctores = await CitaService.getDoctoresByServicio(idservicio);
      res.json(doctores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getHorariosDisponibles: async (req, res) => {
    try {
      const { iddoctor, fecha } = req.params;
      const horariosDisponibles = await CitaService.getHorariosDisponibles(
        iddoctor,
        fecha
      );
      res.json(horariosDisponibles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  verificarCitaExistente: async (req, res) => {
    try {
      const { idpaciente, iddoctor, fecha } = req.params;
      const existe = await CitaService.verificarCitaExistente(
        parseInt(idpaciente),
        parseInt(iddoctor),
        fecha
      );
      res.json({ existe });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  agendarCita: async (req, res) => {
    try {
      const nuevaCita = await CitaService.agendarCita(req.body);
      res.status(201).json(nuevaCita);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  insertPacienteDoctor: async (req, res) => {
    try {
      const { idpaciente, iddoctor } = req.body;
      const result = await CitaService.insertPacienteDoctor(
        idpaciente,
        iddoctor
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = CitaController;