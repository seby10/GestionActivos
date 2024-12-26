import { pool } from "../config/database.js";

export const addMantenimiento = async (mantenimiento) => {
    const { codigo, nombre, fecha, tecnico, tipoTecnico } = mantenimiento;
    try {
      const tecnicoField = tipoTecnico === "interno" ? "ID_TEC_INT" : "ID_TEC_EXT";
      const [result] = await pool.query(
        `INSERT INTO MANTENIMIENTOS (COD_MANT, DESC_MANT, FEC_INI_MANT, ${tecnicoField}) VALUES (?, ?, ?, ?)`,
        [codigo, nombre, fecha, tecnico]
      );
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error("Error al agregar el mantenimiento:", error);
      throw error;
    }
  };

export const finalizarMantenimiento = async (id) => {
  try {
    const [result] = await pool.query(
      "UPDATE MANTENIMIENTOS SET ESTADO_MANT = 'Finalizado', FEC_FIN_MANT = CURDATE() WHERE ID_MANT = ?",
      [id]
    );
    return { success: true };
  } catch (error) {
    console.error("Error al finalizar el mantenimiento:", error);
    throw new Error("Error al finalizar el mantenimiento");
  }
};

export const addDetallesMantenimiento = async (detalle) => {
  const { id_act, id_mant_per } = detalle;
  try {
    const [result] = await pool.query(
      "INSERT INTO DETALLES_MANTENIMIENTO (ID_ACT_MANT, ID_MANT_ASO) VALUES (?, ?)",
      [id_act, id_mant_per]
    );
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Error al agregar el detalle de mantenimiento:", error);
    throw new Error("Error al agregar el detalle de mantenimiento");
  }
};

export const getActivosByEstado = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM ACTIVOS WHERE EST_ACT != 'En Mantenimiento'"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching activos:", error);
    throw error;
  }
};

export const getMantenimientos = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM MANTENIMIENTOS");
    return rows;
  } catch (error) {
    console.error("Error fetching activos:", error);
    throw error;
  }
};

export const getDetallesMantenimiento = async (id) => {
  try {
    const [rows] = await pool.query(
      "SELECT DM.*, A.COD_ACT, A.NOM_ACT, A.EST_ACT FROM DETALLES_MANTENIMIENTO DM JOIN ACTIVOS A ON DM.ID_ACT_MANT = A.ID_ACT WHERE DM.ID_MANT_ASO = ?",
      [id]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching detalles mantenimiento:", error);
    throw error;
  }
};

export const updateActivoEstado = async (id) => {
  try {
    const query = `
          UPDATE ACTIVOS
          SET EST_ACT = 'En mantenimiento'
          WHERE ID_ACT = ?`;
    const [result] = await pool.query(query, [id]);
    return result;
  } catch (error) {
    console.error("Error updating estado del activo:", error);
    throw error;
  }
};
