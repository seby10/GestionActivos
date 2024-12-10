import { pool } from "../config/database.js";

export const getAllActivos = async () => {
  try {
    const [rows] = await pool.query(`
        SELECT 
          a.ID_ACT, 
          a.NOM_ACT, 
          a.MAR_ACT, 
          a.MOD_ACT, 
          a.CAT_ACT, 
          a.UBI_ACT, 
          a.EST_ACT, 
          p.NOM_PRO AS NOM_PRO 
        FROM ACTIVOS a 
        LEFT JOIN PROVEEDORES p ON a.ID_PRO = p.ID_PRO
      `);

    return rows;
  } catch (error) {
    console.error("Error fetching activos:", error);
    throw error;
  }
};

export const getActivoByIdFromDB = async (id) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ACTIVOS WHERE ID_ACT = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error("Error al obtener el activo por ID:", error);
    throw new Error("Error al obtener el activo");
  }
};

export const addActivo = async (activo) => {
  const { NOM_ACT, CAT_ACT, UBI_ACT, EST_ACT } = activo;
  try {
    const [result] = await pool.query(
      "INSERT INTO ACTIVOS (NOM_ACT, CAT_ACT, UBI_ACT, EST_ACT) VALUES (?, ?, ?, ?)",
      [NOM_ACT, CAT_ACT, UBI_ACT, EST_ACT]
    );
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Error al agregar el activo:", error);
    throw new Error("Error al agregar el activo");
  }
};

export const updateActivo = async (id, activoData) => {
  try {
    const { NOM_ACT, MAR_ACT, MOD_ACT, CAT_ACT, UBI_ACT, EST_ACT } = activoData;
    const query = `
        UPDATE ACTIVOS
        SET NOM_ACT = ?,MAR_ACT=?,MOD_ACT=?, CAT_ACT = ?, UBI_ACT = ?, EST_ACT = ?
        WHERE ID_ACT = ?`;
    const [result] = await pool.query(query, [
      NOM_ACT,
      MAR_ACT,
      MOD_ACT,
      CAT_ACT,
      UBI_ACT,
      EST_ACT,
      id,
    ]);
    return result;
  } catch (error) {
    console.error("Error updating activo:", error);
    throw error;
  }
};
