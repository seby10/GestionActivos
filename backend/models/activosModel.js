import { pool } from "../config/database.js";

export const getAllActivos = async () => {
  try {
    const [rows] = await pool.query(`
        SELECT 
          a.ID_ACT, 
          a.COD_ACT, 
          a.NOM_ACT, 
          a.MAR_ACT, 
          a.CAT_ACT, 
          a.UBI_ACT, 
          a.EST_ACT, 
          a.PC_ACT,
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
  const {
    COD_ACT,
    NOM_ACT,
    MAR_ACT,
    CAT_ACT,
    UBI_ACT,
    EST_ACT,
    ID_PRO,
    PC_ACT,
  } = activo;

  const marca = MAR_ACT && MAR_ACT.trim() !== "" ? MAR_ACT : "Desconocido";

  try {
    const [result] = await pool.query(
      "INSERT INTO ACTIVOS (COD_ACT,NOM_ACT, MAR_ACT, CAT_ACT, UBI_ACT, EST_ACT, ID_PRO, PC_ACT) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [COD_ACT, NOM_ACT, marca, CAT_ACT, UBI_ACT, EST_ACT, ID_PRO, PC_ACT]
    );
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Error al agregar el activo:", error);
    throw new Error("Error al agregar el activo");
  }
};

export const updateActivo = async (id, activoData) => {
  try {
    const { NOM_ACT, MAR_ACT, CAT_ACT, UBI_ACT, EST_ACT } = activoData;
    const query = `
        UPDATE ACTIVOS
        SET NOM_ACT = ?,MAR_ACT=?, CAT_ACT = ?, UBI_ACT = ?, EST_ACT = ?
        WHERE ID_ACT = ?`;
    const [result] = await pool.query(query, [
      NOM_ACT,
      MAR_ACT,
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

export const fetchActivoData = async (idDetMant, idMant) => {
  try {
    // Obtener todas las actividades relacionadas con el detalle de mantenimiento
    const [actividades] = await pool.query(
      `SELECT a.id, a.descripcion,
       CASE WHEN aa.actividad_id IS NOT NULL THEN true ELSE false END AS seleccionado
      FROM actividades a
      LEFT JOIN activo_actividad aa ON a.id = aa.actividad_id AND aa.id_det_mant = ?
      `,
      [idDetMant]
    );

    // Obtener todos los componentes relacionados con el detalle de mantenimiento
    const [componentes] = await pool.query(
      `SELECT c.id, c.descripcion,
       CASE WHEN ac.componente_id IS NOT NULL THEN true ELSE false END AS seleccionado
FROM componentes c
LEFT JOIN activo_componente ac ON c.id = ac.componente_id AND ac.id_det_mant = ?
`,
      [idDetMant]
    );

    // Obtener estado del mantenimiento
    const [estadoMantenimiento] = await pool.query(
      `SELECT EST_DET_MANT FROM DETALLES_MANTENIMIENTO WHERE ID_DET_MANT = ?`,
      [idDetMant]
    );
    const estado =
      estadoMantenimiento.length > 0
        ? estadoMantenimiento[0].EST_DET_MANT
        : null;

    return { actividades, componentes, estadoMantenimiento: estado };
  } catch (error) {
    console.error("Error al obtener datos del activo:", error);
    throw error;
  }
};

export const updateActivoRelacionesInDB = async (
  id,
  actividadesSeleccionadas,
  componentesSeleccionados
) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Actualizar actividades
    await connection.query(
      `DELETE FROM activo_actividad WHERE id_det_mant = ?`,
      [id]
    );
    if (actividadesSeleccionadas.length > 0) {
      const actividadesValues = actividadesSeleccionadas.map((a) => [id, a]);
      await connection.query(
        `INSERT INTO activo_actividad (id_det_mant, actividad_id) VALUES ?`,
        [actividadesValues]
      );
    }

    // Actualizar componentes
    await connection.query(
      `DELETE FROM activo_componente WHERE id_det_mant = ?`,
      [id]
    );
    if (componentesSeleccionados.length > 0) {
      const componentesValues = componentesSeleccionados.map((c) => [id, c]);
      await connection.query(
        `INSERT INTO activo_componente (id_det_mant, componente_id) VALUES ?`,
        [componentesValues]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error al actualizar relaciones del activo:", error);
    throw error;
  } finally {
    connection.release();
  }
};
