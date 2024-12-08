import { pool } from "../config/database.js";

export const getAllProveedores = async () => {
  try {
    const [rows] = await pool.query("SELECT ID_PRO, NOM_PRO FROM PROVEEDORES");
    return rows;
  } catch (error) {
    console.error("Error fetching proveedores:", error);
    throw error;
  }
};
