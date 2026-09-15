const { getPacientes, addPaciente, checkCiExists } = require("../services/pacientesService");

const getPacientesHandler = async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const searchTerm = req.query.search || '';

    console.log('getPacientesHandler - Params:', { userId, page, pageSize, searchTerm });

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }

    const pacientes = await getPacientes(userId, page, pageSize, searchTerm);
    console.log('getPacientesHandler - Result:', pacientes);
    
    res.setHeader('Content-Type', 'application/json');
    res.json(pacientes);
  } catch (error) {
    console.error("Error fetching pacientes:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// ✅ NUEVO HANDLER: Verificar CI
const checkCiHandler = async (req, res) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res.status(400).json({ error: "CI es requerido" });
    }

    const pacienteExistente = await checkCiExists(ci);
    console.log('checkCiHandler - CI:', ci, 'Existe:', !!pacienteExistente);

    res.setHeader('Content-Type', 'application/json');
    res.json({
      exists: !!pacienteExistente,
      paciente: pacienteExistente,
    });
  } catch (error) {
    console.error("Error checking CI:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const addPacienteHandler = async (req, res) => {
  try {
    const newPaciente = req.body;
    console.log("Datos recibidos en el backend:", newPaciente);

    if (!newPaciente.nombre_Completo || !newPaciente.ci) {
      return res.status(400).json({ error: "Nombre completo y CI son requeridos" });
    }

    // ✅ Validación adicional: verificar CI antes de insertar
    const ciExistente = await checkCiExists(newPaciente.ci);
    if (ciExistente) {
      return res.status(400).json({ 
        error: "El CI ya existe",
        paciente: ciExistente 
      });
    }

    const paciente = await addPaciente(newPaciente);
    console.log("Paciente agregado:", paciente);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(paciente);
  } catch (error) {
    console.error("Error adding paciente:", error);

    if (error.code === "23505" && error.constraint === "unique_ci") {
      return res.status(400).json({ error: "El CI ya existe" });
    }

    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

module.exports = {
  getPacientesHandler,
  addPacienteHandler,
  checkCiHandler,
};