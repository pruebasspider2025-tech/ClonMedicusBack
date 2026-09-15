const historialClinicoService = require("../services/historialclinicoservice");

const getHistorialClinico = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "Se requiere el ID del doctor" });
    }

    const historial = await historialClinicoService.getHistorialClinico(
      idPaciente,
      doctorId
    );
    res.json(historial);
  } catch (error) {
    console.error("Error en getHistorialClinico:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const addConsulta = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { idcita, antecedente, notas_paciente, servicios } = req.body;

    if (!idcita || !antecedente || !servicios) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos: idcita, antecedente y servicios" });
    }

    // Guardar la consulta
    const nuevaConsulta = await historialClinicoService.addConsulta(
      idPaciente,
      idcita,
      antecedente,
      servicios
    );

    // Actualizar notas del paciente si existen
    if (notas_paciente) {
      await historialClinicoService.updatePacienteNotas(
        idPaciente,
        notas_paciente
      );
    }

    res.status(201).json(nuevaConsulta);
  } catch (error) {
    console.error("Error en addConsulta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const addPago = async (req, res) => {
  try {
    const { idcita, monto } = req.body;

    if (!idcita || !monto) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos: idcita y monto" });
    }

    const nuevoPago = await historialClinicoService.addPago(idcita, monto);
    res.status(201).json(nuevoPago);
  } catch (error) {
    console.error("Error en addPago:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updatePacienteNotas = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { notas } = req.body;

    if (!notas) {
      return res.status(400).json({ error: "Faltan las notas del paciente" });
    }

    const pacienteActualizado =
      await historialClinicoService.updatePacienteNotas(idPaciente, notas);
    res.json(pacienteActualizado);
  } catch (error) {
    console.error("Error en updatePacienteNotas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getServicios = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "Se requiere el ID del usuario" });
    }

    const servicios = await historialClinicoService.getServicios(userId);
    res.json(servicios);
  } catch (error) {
    console.error("Error en getServicios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updatePaciente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const {
      nombre_completo,
      telefono,
      fecha_nacimiento,
      tipo_sangre,
      genero,
      direccion,
      alergias,
      enfermedad_base,
      notas,
    } = req.body;

    const pacienteActualizado = await historialClinicoService.updatePaciente(
      idPaciente,
      nombre_completo,
      telefono,
      fecha_nacimiento,
      tipo_sangre,
      genero,
      direccion,
      alergias,
      enfermedad_base,
      notas
    );
    res.json(pacienteActualizado);
  } catch (error) {
    console.error("Error en updatePaciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updateCitaEstado = async (req, res) => {
  try {
    const { idcita } = req.params;
    const { estado } = req.body;

    if (!idcita || estado === undefined) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos: idcita y estado" });
    }

    const citaActualizada = await historialClinicoService.updateCitaEstado(
      idcita,
      estado
    );
    res.json(citaActualizada);
  } catch (error) {
    console.error("Error en updateCitaEstado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getDoctorInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const doctorInfo = await historialClinicoService.getDoctorInfo(userId);
    res.json(doctorInfo);
  } catch (error) {
    console.error("Error en getDoctorInfo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// NUEVO CONTROLADOR: Actualizar antecedente
const updateAntecedente = async (req, res) => {
  try {
    const { idhistoria } = req.params;
    const { antecedente } = req.body;

    if (!idhistoria || !antecedente) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos: idhistoria y antecedente" });
    }

    // Verificar que la historia sea de hoy
    const esDeHoy = await historialClinicoService.esHistoriaDeHoy(idhistoria);
    if (!esDeHoy) {
      return res
        .status(403)
        .json({ error: "Solo se pueden editar los antecedentes del día de hoy" });
    }

    const antecedenteActualizado =
      await historialClinicoService.updateAntecedente(idhistoria, antecedente);
    res.json(antecedenteActualizado);
  } catch (error) {
    console.error("Error en updateAntecedente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getHistorialClinico,
  addConsulta,
  addPago,
  updatePacienteNotas,
  getServicios,
  updatePaciente,
  updateCitaEstado,
  getDoctorInfo,
  updateAntecedente,
};