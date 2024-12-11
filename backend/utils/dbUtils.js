import { pool } from "../config/database.js";

const userTableQuery = `CREATE TABLE IF NOT EXISTS USUARIOS (
    ID_USU INT AUTO_INCREMENT PRIMARY KEY,
    NOM_USU VARCHAR(100) NOT NULL,
    COR_USU VARCHAR(100) NOT NULL UNIQUE,
    CON_USU VARCHAR(255) NOT NULL,
    TIP_USU ENUM('admin', 'tecnico') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;


const proveedorTableQuery = `CREATE TABLE IF NOT EXISTS PROVEEDORES (
    ID_PRO INT AUTO_INCREMENT PRIMARY KEY,
    NOM_PRO VARCHAR(100) NOT NULL,
    DIR_PRO VARCHAR(255),
    TEL_PRO VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;


const activoTableQuery = `CREATE TABLE IF NOT EXISTS ACTIVOS (
    ID_ACT INT AUTO_INCREMENT PRIMARY KEY,
    NOM_ACT VARCHAR(100) NOT NULL,
    MAR_ACT VARCHAR(100) NOT NULL,
    MOD_ACT VARCHAR(100) NOT NULL,
    CAT_ACT ENUM('Informático', 'Mueble', 'Electrónico', 'Vehículo', 'Mobiliario de oficina', 'Herramienta', 'Equipamiento médico', 'Equipos de comunicación', 'Instrumento de laboratorio', 'Equipo de producción', 'Equipo de seguridad', 'Otros') NOT NULL,
    UBI_ACT ENUM('Laboratorio A', 'Laboratorio B', 'Laboratorio C', 'Laboratorio D', 'Aula 1', 'Aula 2', 'Aula 3') NOT NULL,
    EST_ACT ENUM('Disponible', 'Mantenimiento', 'Asignado') NOT NULL,
    ID_PRO INT,
    PC_ACT VARCHAR(100),
    FOREIGN KEY (ID_PRO) REFERENCES PROVEEDORES(ID_PRO) ON DELETE SET NULL,
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
    await createTable("Proveedores", proveedorTableQuery);
    await createTable("Activos", activoTableQuery);
    console.log("All tables created successfully!!");
  } catch (error) {
    console.log("Error creating tables", error);
    throw error;
  }
};

export default createAllTable;
