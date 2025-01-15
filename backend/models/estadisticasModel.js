import { pool } from "../config/database.js";

export const getActividadesMasFrecuentes = async () => {
  try {
    const [rows] = await pool.query(`
        SELECT a.descripcion, COUNT(aa.id) as frecuencia 
        FROM actividades a
        LEFT JOIN activo_actividad aa ON a.id = aa.actividad_id
        GROUP BY a.id, a.descripcion
        ORDER BY frecuencia DESC
        LIMIT 5
      `);
    return rows;
  } catch (error) {
    console.error("Error fetching actividades mas frecuentes:", error);
    throw error;
  }
};

export const getComponentesMasUsados = async () => {
  try {
    const [rows] = await pool.query(`
          SELECT c.descripcion, COUNT(ac.id) as cantidad 
          FROM componentes c
          LEFT JOIN activo_componente ac ON c.id = ac.componente_id
          GROUP BY c.id, c.descripcion
          ORDER BY cantidad DESC
          LIMIT 5
        `);
    return rows;
  } catch (error) {
    console.error("Error fetching componentes mas usados:", error);
    throw error;
  }
};

export const getRegistroMantenimientos = async () => {
  try {
    const [rows] = await pool.query(`
        SELECT
          dm.ID_DET_MANT,
          m.COD_MANT,
          m.FEC_INI_MANT,
          m.FEC_FIN_MANT,
          m.DESC_MANT,
          dm.EST_DET_MANT,
          a.NOM_ACT,
          GROUP_CONCAT(DISTINCT act.descripcion) as actividades,
          GROUP_CONCAT(DISTINCT c.descripcion) as componentes,
          p.NOM_PRO,
          u.NOM_USU 
        FROM MANTENIMIENTOS m
        INNER JOIN DETALLES_MANTENIMIENTO dm ON m.ID_MANT = dm.ID_MANT_ASO
        INNER JOIN ACTIVOS a ON dm.ID_ACT_MANT = a.ID_ACT
        LEFT JOIN activo_actividad aa ON dm.ID_DET_MANT = aa.id_det_mant
        LEFT JOIN actividades act ON aa.actividad_id = act.id
        LEFT JOIN activo_componente ac ON dm.ID_DET_MANT = ac.id_det_mant
        LEFT JOIN componentes c ON ac.componente_id = c.id
        LEFT JOIN PROVEEDORES p ON m.ID_TEC_EXT = p.ID_PRO 
        LEFT JOIN USUARIOS u ON m.ID_TEC_INT = u.ID_USU
        GROUP BY m.COD_MANT, m.FEC_INI_MANT, m.DESC_MANT, a.NOM_ACT
        ORDER BY m.FEC_INI_MANT DESC
      `);
    return rows;
  } catch (error) {
    console.error("Error fetching registro mantenimientos:", error);
    throw error;
  }
};

export const getMantenimientosPorPeriodo = async (
  fechaInicio,
  fechaFin,
  agrupacion = "day"
) => {
  try {
    const fechaInicioCompleta = `${fechaInicio} 00:00:00`;
    const fechaFinCompleta = `${fechaFin} 23:59:59`;
    const groupFormat = {
      day: {
        sql: "%Y-%m-%d",
        display: "%d %M %Y",
      },
      week: {
        sql: "%Y-%u",
        display: "Semana %u, %Y",
      },
      month: {
        sql: "%Y-%m",
        display: "%M %Y",
      },
    };

    const [rows] = await pool.query(
      `
      WITH RECURSIVE DateSequence AS (
        SELECT ? as fecha
        UNION ALL
        SELECT 
          CASE 
            WHEN ? = 'day' THEN fecha + INTERVAL 1 DAY
            WHEN ? = 'week' THEN fecha + INTERVAL 1 WEEK
            WHEN ? = 'month' THEN fecha + INTERVAL 1 MONTH
          END
        FROM DateSequence
        WHERE fecha < ?
      )
      SELECT 
        DATE_FORMAT(d.fecha, ?) as periodo,
        DATE_FORMAT(d.fecha, ?) as periodo_display,
        COUNT(m.ID_MANT) as cantidad
      FROM DateSequence d
      LEFT JOIN MANTENIMIENTOS m ON 
        DATE_FORMAT(m.FEC_INI_MANT, ?) = DATE_FORMAT(d.fecha, ?)
      GROUP BY periodo, periodo_display
      ORDER BY periodo;
      `,
      [
        fechaInicioCompleta,
        agrupacion,
        agrupacion,
        agrupacion,
        fechaFinCompleta,
        groupFormat[agrupacion].sql,
        groupFormat[agrupacion].display,
        groupFormat[agrupacion].sql,
        groupFormat[agrupacion].sql,
      ]
    );

    return rows.map((row) => ({
      periodo: row.periodo,
      label: row.periodo_display,
      cantidad: Number(row.cantidad),
    }));
  } catch (error) {
    console.error("Error en getMantenimientosPorPeriodo:", error);
    throw error;
  }
};

export const getEstadisticasMantenimiento = async (fechaInicio, fechaFin) => {
  try {
    const fechaInicioCompleta = `${fechaInicio} 00:00:00`;
    const fechaFinCompleta = `${fechaFin} 23:59:59`;
    const [rows] = await pool.query(
      `
        SELECT 
          COUNT(*) as total_mantenimientos,
          COUNT(CASE WHEN ESTADO_MANT = 'Finalizado' THEN 1 END) as mantenimientos_finalizados,
          TRUNCATE(AVG(TIMESTAMPDIFF(HOUR, FEC_INI_MANT, FEC_FIN_MANT)), 2) as promedio_duracion_horas,
          MIN(TIMESTAMPDIFF(HOUR, FEC_INI_MANT, FEC_FIN_MANT)) as min_duracion_horas,
          MAX(TIMESTAMPDIFF(HOUR, FEC_INI_MANT, FEC_FIN_MANT)) as max_duracion_horas
        FROM MANTENIMIENTOS
        WHERE FEC_INI_MANT BETWEEN ? AND ?
      `,
      [fechaInicioCompleta, fechaFinCompleta]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

export const getActivosMasMantenidos = async (fechaInicio, fechaFin) => {
  try {
    const fechaInicioCompleta = `${fechaInicio} 00:00:00`;
    const fechaFinCompleta = `${fechaFin} 23:59:59`;
    const [rows] = await pool.query(
      `
        SELECT 
          a.NOM_ACT,
          a.COD_ACT,
          COUNT(dm.ID_DET_MANT) as cantidad_mantenimientos
        FROM ACTIVOS a
        INNER JOIN DETALLES_MANTENIMIENTO dm ON a.ID_ACT = dm.ID_ACT_MANT
        INNER JOIN MANTENIMIENTOS m ON dm.ID_MANT_ASO = m.ID_MANT
        WHERE m.FEC_INI_MANT BETWEEN ? AND ?
        GROUP BY a.ID_ACT, a.NOM_ACT, a.COD_ACT
        ORDER BY cantidad_mantenimientos DESC
        LIMIT 4
      `,
      [fechaInicioCompleta, fechaFinCompleta]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

export const getDistribucionEstados = async (fechaInicio, fechaFin) => {
  try {
    const fechaInicioCompleta = `${fechaInicio} 00:00:00`;
    const fechaFinCompleta = `${fechaFin} 23:59:59`;
    const [rows] = await pool.query(
      `
        SELECT 
          EST_ACT,
          COUNT(*) as cantidad
        FROM ACTIVOS a
        INNER JOIN DETALLES_MANTENIMIENTO dm ON a.ID_ACT = dm.ID_ACT_MANT
        INNER JOIN MANTENIMIENTOS m ON dm.ID_MANT_ASO = m.ID_MANT
        WHERE m.FEC_INI_MANT BETWEEN ? AND ?
        GROUP BY EST_ACT
      `,
      [fechaInicioCompleta, fechaFinCompleta]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

export const getActividadesMasFrecuentesFecha = async (
  fechaInicio,
  fechaFin
) => {
  try {
    const fechaInicioCompleta = `${fechaInicio} 00:00:00`;
    const fechaFinCompleta = `${fechaFin} 23:59:59`;

    const [rows] = await pool.query(
      `
        SELECT a.descripcion, COUNT(aa.id) AS frecuencia
        FROM actividades a
        LEFT JOIN activo_actividad aa ON a.id = aa.actividad_id
        LEFT JOIN detalles_mantenimiento dm ON aa.id_det_mant = dm.ID_DET_MANT
        LEFT JOIN mantenimientos m ON dm.ID_MANT_ASO = m.ID_MANT
        WHERE m.FEC_INI_MANT BETWEEN ? AND ?
        GROUP BY a.id, a.descripcion
        ORDER BY frecuencia DESC
        LIMIT 5;
      `,
      [fechaInicioCompleta, fechaFinCompleta]
    );

    return rows;
  } catch (error) {
    console.error("Error fetching actividades mas frecuentes:", error);
    throw error;
  }
};

export const getComponentesMasUsadosFecha = async (fechaInicio, fechaFin) => {
  try {
    const fechaInicioCompleta = `${fechaInicio} 00:00:00`;
    const fechaFinCompleta = `${fechaFin} 23:59:59`;

    const [rows] = await pool.query(
      `
          SELECT c.descripcion, COUNT(ac.id) AS cantidad
          FROM componentes c
          LEFT JOIN activo_componente ac ON c.id = ac.componente_id
          LEFT JOIN detalles_mantenimiento dm ON ac.id_det_mant = dm.ID_DET_MANT
          LEFT JOIN mantenimientos m ON dm.ID_MANT_ASO = m.ID_MANT
          WHERE m.FEC_INI_MANT BETWEEN ? AND ?
          GROUP BY c.id, c.descripcion
          ORDER BY cantidad DESC
          LIMIT 5;
        `,
      [fechaInicioCompleta, fechaFinCompleta]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching componentes mas usados:", error);
    throw error;
  }
};
