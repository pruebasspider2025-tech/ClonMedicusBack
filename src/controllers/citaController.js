const CitaService = require("../services/citaService");

const CitaController = {
  getPacientes: async (req, res) => {
    try {
      const searchTerm = req.query.search || "";
      const pacientes = await CitaService.getPacientes(searchTerm);
      res.json(pacientes);
    } catch (error) {
      console.error("❌ getPacientes:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getPacienteById: async (req, res) => {
    try {
      const { idpaciente } = req.params;
      const paciente = await CitaService.getPacienteById(idpaciente);
      if (!paciente) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      res.json(paciente);
    } catch (error) {
      console.error("❌ getPacienteById:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getServicios: async (req, res) => {
    try {
      const servicios = await CitaService.getServicios();
      res.json(servicios);
    } catch (error) {
      console.error("❌ getServicios:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getDoctoresByServicio: async (req, res) => {
    try {
      const { idservicio } = req.params;
      const doctores = await CitaService.getDoctoresByServicio(idservicio);
      res.json(doctores);
    } catch (error) {
      console.error("❌ getDoctoresByServicio:", error);
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
      console.error("❌ getHorariosDisponibles:", error);
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
      console.error("❌ verificarCitaExistente:", error);
      res.status(500).json({ message: error.message });
    }
  },

  agendarCita: async (req, res) => {
    try {
      console.log("📥 Body recibido en agendarCita:", req.body);

      const { idpaciente, iddoctor, idservicio, fecha, hora } = req.body;

      // Validación explícita para devolver 400 con mensaje claro
      const faltantes = [];
      if (!idpaciente) faltantes.push("idpaciente");
      if (!iddoctor) faltantes.push("iddoctor");
      if (!idservicio) faltantes.push("idservicio");
      if (!fecha) faltantes.push("fecha");
      if (!hora) faltantes.push("hora");

      if (faltantes.length > 0) {
        return res.status(400).json({
          message: `Faltan campos obligatorios: ${faltantes.join(", ")}`,
        });
      }

      const nuevaCita = await CitaService.agendarCita(req.body);
      res.status(201).json(nuevaCita);
    } catch (error) {
      console.error("❌ agendarCita:", error);
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
      console.error("❌ insertPacienteDoctor:", error);
      res.status(500).json({ message: error.message });
    }
  }, 
    getDoctoresByEspecialidad: async (req, res) => {
    try {
      const { idespecialidad } = req.params;
      const doctores = await CitaService.getDoctoresByEspecialidad(idespecialidad);
      res.json(doctores);
    } catch (error) {
      console.error("❌ getDoctoresByEspecialidad:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = CitaController;