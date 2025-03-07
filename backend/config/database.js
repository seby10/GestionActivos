import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
});

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conexion exitosa hacia la base!");
    connection.release();
  } catch (error) {
    console.log("Error al conectarse con la base!");
    throw error;
  }
};

export { pool, checkConnection };
