const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const authRoutes = require("./src/routes/authRoutes");
const gestionUsuariosRoutes = require("./src/routes/gestionUsuariosRoutes");
const pacientesDiaRoutes = require("./src/routes/pacientesDiaRoutes");
const pacientesRoutes = require("./src/routes/pacientesRoutes");
const serviciosRoutes = require("./src/routes/serviciosRoutes");
const movimientoCajaRoutes = require("./src/routes/movimientoCajaRoutes");
const historialPagosRoutes = require("./src/routes/historialPagosRoutes");
const cobrosRoutes = require("./src/routes/cobrosroutes");
const listacitasRoutes = require("./src/routes/listacitasroutes");
const historialClinicoRoutes = require("./src/routes/historialclinicoroutes");
const especialidadesRoutes = require("./src/routes/especialidadesRoutes");
const citaRoutes = require("./src/routes/citaRoutes");
const ListaEspecialidad = require("./src/routes/listaespecialidadroutes");
const ListaPacients = require("./src/routes/listapacientesRoutes");
const doctorCalendarRoutes = require("./src/routes/DoctorCalendarRoutes");

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:8080",
      "https://medicussl.netlify.app",
      "https://medicusback.onrender.com",
      "https://mutant-back-reserva.onrender.com",
    ];
    
  
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // para manejar preflight OPTIONS

app.use(express.json()); // Para parsear JSON en solicitudes

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api", gestionUsuariosRoutes);
app.use("/api", pacientesDiaRoutes);
app.use("/api", pacientesRoutes);
app.use("/api", serviciosRoutes);
app.use("/api", movimientoCajaRoutes);
app.use("/api", historialPagosRoutes);
app.use("/api", cobrosRoutes);
app.use("/api", listacitasRoutes);
app.use("/api", historialClinicoRoutes);
app.use("/api", especialidadesRoutes);
app.use("/api", citaRoutes);
app.use("/api", ListaEspecialidad);
app.use("/api", ListaPacients);
app.use("/api", doctorCalendarRoutes);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
};

startServer();