import { pool } from "../config/database.js";

export const addMantenimiento = async (mantenimiento) => {
  const { codigo, descripcion, fecha, tecnico, tipoTecnico } = mantenimiento;
  try {
    const tecnicoField =
      tipoTecnico === "internal" ? "ID_TEC_INT" : "ID_TEC_EXT";
    const [result] = await pool.query(
      `INSERT INTO MANTENIMIENTOS (COD_MANT, DESC_MANT, FEC_INI_MANT, ${tecnicoField}) VALUES (?, ?, ?, ?)`,
      [codigo, descripcion, fecha, tecnico]
    );
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Error al agregar el mantenimiento:", error);
    throw error;
  }
};

export const finalizarMantenimiento = async (id) => {
  try {
    await pool.query("START TRANSACTION");

    const [detalles] = await pool.query(
      "SELECT * FROM DETALLES_MANTENIMIENTO WHERE ID_MANT_ASO = ?",
      [id]
    );

    for (const detalle of detalles) {
      await pool.query(
        "UPDATE ACTIVOS SET EST_ACT = 'Disponible' WHERE ID_ACT = ?",
        [detalle.ID_ACT_MANT]
      );
    }

    // Actualizar estado del mantenimiento
    const [result] = await pool.query(
      "UPDATE MANTENIMIENTOS SET ESTADO_MANT = 'Finalizado', FEC_FIN_MANT = NOW() WHERE ID_MANT = ?",
      [id]
    );

    // Confirmar transacción
    await pool.query("COMMIT");
    return { success: true };
  } catch (error) {
    // Revertir cambios si hay error
    await pool.query("ROLLBACK");
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
      "SELECT *, p.NOM_PRO FROM ACTIVOS LEFT JOIN PROVEEDORES p ON ACTIVOS.ID_PRO = p.ID_PRO WHERE EST_ACT != 'En Mantenimiento' AND EST_ACT != 'No Disponible'"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching activos:", error);
    throw error;
  }
};

export const getMantenimientos = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.*, 
        p.NOM_PRO AS NOM_PRO, 
        u.NOM_USU 
      FROM 
        MANTENIMIENTOS m 
      LEFT JOIN 
        PROVEEDORES p ON m.ID_TEC_EXT = p.ID_PRO 
      LEFT JOIN 
        USUARIOS u ON m.ID_TEC_INT = u.ID_USU
      ORDER BY FEC_INI_MANT DESC;
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching mantenimientos:", error);
    throw error;
  }
};

export const getDetallesMantenimiento = async (id) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        DM.*, 
        A.COD_ACT, 
        A.NOM_ACT, 
        A.MAR_ACT, 
        A.CAT_ACT, 
        A.UBI_ACT, 
        A.EST_ACT, 
        A.ID_PRO, 
        P.NOM_PRO 
      FROM 
        DETALLES_MANTENIMIENTO DM
      JOIN 
        ACTIVOS A ON DM.ID_ACT_MANT = A.ID_ACT
      JOIN 
        PROVEEDORES P ON A.ID_PRO = P.ID_PRO
      WHERE 
        DM.ID_MANT_ASO = ?
      `,
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

export const updateActivoEstadoD = async (id) => {
  try {
    const query = `
      UPDATE ACTIVOS
      SET EST_ACT = 'Disponible'
      WHERE ID_ACT = ?`;
    const [result] = await pool.query(query, [id]);
    return result;
  } catch (error) {
    console.error("Error updating estado del activo:", error);
    throw error;
  }
};

export const finalizarMantenimientoActivo = async (activoId) => {
  try {
    const queryMantenimiento = `
      UPDATE DETALLES_MANTENIMIENTO
      SET EST_DET_MANT = 'Finalizado'
      WHERE id_det_mant = ? AND EST_DET_MANT != 'Finalizado'`;

    const [mantenimientoResult] = await pool.query(queryMantenimiento, [
      activoId,
    ]);

    if (mantenimientoResult.affectedRows === 0) {
      return mantenimientoResult;
    }

    return mantenimientoResult;
  } catch (error) {
    console.error(
      "Error al finalizar mantenimiento y actualizar el estado del activo:",
      error
    );
    throw error;
  }
};
export const canRemoveAssetFromMaintenance = async (maintenanceId, assetId) => {
  const query = `
    SELECT 
      NOT EXISTS(
        SELECT 1 
        FROM activo_actividad aa 
        JOIN DETALLES_MANTENIMIENTO dm ON aa.id_det_mant = dm.ID_DET_MANT 
        WHERE dm.ID_MANT_ASO = ? AND dm.ID_ACT_MANT = ?
      ) AND 
      NOT EXISTS(
        SELECT 1 
        FROM activo_componente ac 
        JOIN DETALLES_MANTENIMIENTO dm ON ac.id_det_mant = dm.ID_DET_MANT 
        WHERE dm.ID_MANT_ASO = ? AND dm.ID_ACT_MANT = ?
      ) AS canRemove;
  `;

  const [rows] = await pool.query(query, [
    maintenanceId,
    assetId,
    maintenanceId,
    assetId,
  ]);
  return rows[0].canRemove === 1;
};

export const removeAssetFromMaintenance = async (maintenanceId, assetId) => {
  const query = `
    DELETE FROM DETALLES_MANTENIMIENTO 
    WHERE ID_MANT_ASO = ? AND ID_ACT_MANT = ?
  `;
  await pool.query(query, [maintenanceId, assetId]);
};

export const getActivosByEstadoD = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM ACTIVOS WHERE EST_ACT = 'Disponible'"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching activos:", error);
    throw error;
  }
};

export const updateMaintenance = async (id, { DESC_MANT, FEC_INI_MANT, ID_TEC_INT, ID_TEC_EXT }) => {
  try {
    console.log("Actualizando mantenimiento con los datos:", { DESC_MANT, FEC_INI_MANT, ID_TEC_INT, ID_TEC_EXT, id });

    const query = `
      UPDATE MANTENIMIENTOS
      SET DESC_MANT = ?, FEC_INI_MANT = ?, ID_TEC_INT = ?, ID_TEC_EXT = ?
      WHERE ID_MANT = ?
    `;
    const result = await pool.query(query, [DESC_MANT, FEC_INI_MANT, ID_TEC_INT, ID_TEC_EXT, id]);

    console.log("Resultado de la actualización:", result);

    if (result.affectedRows === 0) {
      console.log("No se actualizó ningún registro. Verifica si el ID es correcto y si los datos son diferentes.");
    }

    return result;

  } catch (error) {
    console.error("Error al actualizar el mantenimiento:", error);
    throw error;
  }
};
