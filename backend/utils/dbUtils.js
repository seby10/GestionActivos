import { pool } from "../config/database.js";

const userTableQuery = `CREATE TABLE IF NOT EXISTS USUARIOS (
    ID_USU INT AUTO_INCREMENT PRIMARY KEY,
    NOM_USU VARCHAR(100) NOT NULL,
    COR_USU VARCHAR(100) NOT NULL UNIQUE,
    CON_USU VARCHAR(255) NOT NULL,
    TIP_USU ENUM('admin', 'tecnico')NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createTable = async (tableName, query) => {
  try {
    await pool.query(query);
    console.log(`${tableName} table created or already exists`);
  } catch (error) {
    console.log(`Error creating ${tableName}`, error);
  }
};

const createAllTable = async () => {
  try {
    await createTable("Users", userTableQuery);
    console.log("All tables created successfully!!");
  } catch (error) {
    console.log("Error creating tables", error);
    throw error;
  }
};

export default createAllTable;