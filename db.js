// db.js
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Conexión a la base de datos exitosa 🚀");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
};

module.exports = { connectDB, pool }; // Usando module.exports
