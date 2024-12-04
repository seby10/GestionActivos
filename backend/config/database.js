import { createConnection } from 'mysql2/promise'; 
import dotenv from 'dotenv'; 


dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const createDbConnection = async () => {
  try {
    const connection = await createConnection(dbConfig);
    console.log("Successfully connected to the database.");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

export default createDbConnection;