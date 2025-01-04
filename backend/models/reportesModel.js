import { pool } from "../config/database.js";

export const getHistorialDB = async (id) => {
  try {
    // Ejecutar la consulta con el id como parámetro
    const [rows] = await pool.query(
      `
      SELECT 
    M.COD_MANT, 
    M.DESC_MANT, 
    M.FEC_INI_MANT, 
    M.FEC_FIN_MANT, 
    M.ESTADO_MANT, 
    A.NOM_ACT AS nombre_activo, 
    DM.EST_DET_MANT AS estado_detalle,  
    GROUP_CONCAT(DISTINCT AC.descripcion ORDER BY AC.descripcion ASC) AS actividades,
    GROUP_CONCAT(DISTINCT CO.descripcion ORDER BY CO.descripcion ASC) AS componentes
FROM 
    MANTENIMIENTOS M
JOIN 
    DETALLES_MANTENIMIENTO DM ON DM.ID_MANT_ASO = M.ID_MANT
JOIN 
    ACTIVOS A ON A.ID_ACT = DM.ID_ACT_MANT
LEFT JOIN 
    activo_actividad AA ON AA.id_det_mant = DM.ID_DET_MANT
LEFT JOIN 
    actividades AC ON AC.id = AA.actividad_id
LEFT JOIN 
    activo_componente AC2 ON AC2.id_det_mant = DM.ID_DET_MANT
LEFT JOIN 
    componentes CO ON CO.id = AC2.componente_id
WHERE 
    A.ID_ACT = ?  -- Reemplazamos con el parámetro id
GROUP BY 
    M.ID_MANT, A.NOM_ACT, DM.EST_DET_MANT  
ORDER BY 
    M.FEC_INI_MANT DESC 
LIMIT 0, 25;

    `,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }
    return rows;
  } catch (error) {
    console.error("Error al obtener el historial del activo:", error);
    throw new Error("Error al obtener el historial del activo");
  }
};
