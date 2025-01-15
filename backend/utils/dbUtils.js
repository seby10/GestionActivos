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
    COD_ACT VARCHAR(10) UNIQUE NOT NULL,
    NOM_ACT VARCHAR(100) NOT NULL,
    MAR_ACT ENUM('Apple', 'Samsung', 'Sony', 'Lenovo', 'Dell', 'HP', 'Acer', 'Asus', 'Toshiba', 'LG', 'Huawei', 'Xiaomi', 'Bosch', 'Makita', 'Caterpillar', 'Ford', 'Chevrolet', 'Toyota', 'Honda', 'General Electric', '3M', 'Philips', 'Panasonic', 'Siemens', 'IBM', 'Cisco', 'Intel', 'AMD', 'Otros') NOT NULL,
    CAT_ACT ENUM('Informático', 'Mueble', 'Electrónico', 'Vehículo', 'Mobiliario de oficina', 'Herramienta', 'Equipamiento médico', 'Equipos de comunicación', 'Instrumento de laboratorio', 'Equipo de producción', 'Equipo de seguridad', 'Otros') NOT NULL,
    UBI_ACT ENUM('Laboratorio A', 'Laboratorio B', 'Laboratorio C', 'Laboratorio D', 'Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Oficina Principal', 'Oficina Secundaria', 'Sala de Juntas', 'Almacén', 'Taller', 'Recepción', 'Pasillo Principal') NOT NULL,
    EST_ACT ENUM('Disponible', 'En Mantenimiento', 'Defectuoso', 'No disponible') NOT NULL,
    ID_PRO INT,
    PC_ACT VARCHAR(100),
    FOREIGN KEY (ID_PRO) REFERENCES PROVEEDORES(ID_PRO) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const mantenimientoTableQuery = `CREATE TABLE IF NOT EXISTS MANTENIMIENTOS (
    ID_MANT INT AUTO_INCREMENT PRIMARY KEY,
    COD_MANT VARCHAR(10) UNIQUE NOT NULL,
    DESC_MANT VARCHAR(255) NOT NULL,
    FEC_INI_MANT DATETIME NOT NULL,
    FEC_FIN_MANT DATETIME DEFAULT NULL,
    ESTADO_MANT ENUM('En ejecucion','Finalizado') DEFAULT 'En ejecucion',
    ID_TEC_INT INT DEFAULT NULL,
    ID_TEC_EXT INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_TEC_INT) REFERENCES USUARIOS(ID_USU) ON DELETE SET NULL,
    FOREIGN KEY (ID_TEC_EXT) REFERENCES PROVEEDORES(ID_PRO) ON DELETE SET NULL
);`;

const detallesMantenimientoTableQuery = `CREATE TABLE IF NOT EXISTS DETALLES_MANTENIMIENTO (
    ID_DET_MANT INT AUTO_INCREMENT PRIMARY KEY,
    ID_MANT_ASO INT,
    ID_ACT_MANT INT,
    EST_DET_MANT ENUM('En mantenimento','Finalizado') DEFAULT 'En mantenimento',
    OBS_DET_MANT VARCHAR(5000),
    FOREIGN KEY (ID_MANT_ASO) REFERENCES MANTENIMIENTOS(ID_MANT) ON DELETE SET NULL,
    FOREIGN KEY (ID_ACT_MANT) REFERENCES ACTIVOS(ID_ACT) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const actividadesTableQuery = `CREATE TABLE IF NOT EXISTS actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL
);`;

const componentesTableQuery = `CREATE TABLE IF NOT EXISTS componentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL
);`;
const activoActividadTableQuery = `CREATE TABLE IF NOT EXISTS activo_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actividad_id INT NOT NULL,
    id_det_mant INT NOT NULL,  
    FOREIGN KEY (actividad_id) REFERENCES actividades(id),
    FOREIGN KEY (id_det_mant) REFERENCES DETALLES_MANTENIMIENTO(ID_DET_MANT),  
    UNIQUE (actividad_id, id_det_mant)
);
`;
const activoComponentesTableQuery = `CREATE TABLE IF NOT EXISTS activo_componente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    componente_id INT NOT NULL,
    id_det_mant INT NOT NULL, 
    FOREIGN KEY (componente_id) REFERENCES componentes(id),
    FOREIGN KEY (id_det_mant) REFERENCES DETALLES_MANTENIMIENTO(ID_DET_MANT),
    UNIQUE (componente_id, id_det_mant) 
);`;

const createTable = async (tableName, query) => {
  try {
    await pool.query(query);
    console.log(`${tableName} table created or already exists`);
  } catch (error) {
    console.log(`Error creating ${tableName}, error:`, error);
  }
};

// const populateEncargados = async () => {
//     try {
//         const [usuarios] = await pool.query('SELECT ID_USU FROM USUARIOS');
//         const [proveedores] = await pool.query('SELECT ID_PRO FROM PROVEEDORES');

//         for (const usuario of usuarios) {
//             await pool.query(
//                 'INSERT IGNORE INTO ENCARGADOS (ID_REFERENCIA, TIPO_ENC) VALUES (?, ?)',
//                 [usuario.ID_USU, 'usuario']
//             );
//         }

//         for (const proveedor of proveedores) {
//             await pool.query(
//                 'INSERT IGNORE INTO ENCARGADOS (ID_REFERENCIA, TIPO_ENC) VALUES (?, ?)',
//                 [proveedor.ID_PRO, 'proveedor']
//             );
//         }

//         console.log('Encargados populated successfully');
//     } catch (error) {
//         console.error('Error populating encargados:', error);
//         throw error;
//     }
// };

const createAllTable = async () => {
  try {
    await createTable("Users", userTableQuery);
    await createTable("Proveedores", proveedorTableQuery);
    //await createTable("Encargados", encargadosTableQuery);
    await createTable("Activos", activoTableQuery);
    await createTable("Mantenimientos", mantenimientoTableQuery);
    await createTable("DetallesMantenimiento", detallesMantenimientoTableQuery);
    await createTable("Actividades", actividadesTableQuery);
    await createTable("Componentes", componentesTableQuery);
    await createTable("ActivosActividades", activoActividadTableQuery);
    await createTable("ActivosComponentes", activoComponentesTableQuery);

    // Poblar la tabla de encargados
    //await populateEncargados();

    console.log("All tables created and populated successfully!!");
  } catch (error) {
    console.log("Error in database setup", error);
    throw error;
  }
};

export default createAllTable;
