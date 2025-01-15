import {
  getActividadesMasFrecuentes,
  getComponentesMasUsados,
  getRegistroMantenimientos,
  getMantenimientosPorPeriodo,
  getEstadisticasMantenimiento,
  getActivosMasMantenidos,
  getDistribucionEstados,
  getActividadesMasFrecuentesFecha,
  getComponentesMasUsadosFecha,
} from "../models/estadisticasModel.js";

export const getActividadesFrecuentesController = async (req, res) => {
  try {
    const actividades = await getActividadesMasFrecuentes();
    res.status(200).json(actividades);
  } catch (error) {
    console.error("Error al obtener las actividades:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las actividades frecuentes." });
  }
};

export const getComponentesUsadosController = async (req, res) => {
  try {
    const componentes = await getComponentesMasUsados();
    res.status(200).json(componentes);
  } catch (error) {
    console.error("Error al obtener los componentes:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los componentes más usados." });
  }
};

export const getRegistroMantenimientosController = async (req, res) => {
  try {
    const registros = await getRegistroMantenimientos();
    res.status(200).json(registros);
  } catch (error) {
    console.error("Error al obtener el registro de mantenimientos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el registro de mantenimientos." });
  }
};

export const getMantenimientosPorPeriodoController = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message:
          "Se requieren fechaInicio y fechaFin como parámetros de consulta.",
      });
    }

    const mantenimientos = await getMantenimientosPorPeriodo(
      fechaInicio,
      fechaFin
    );
    res.status(200).json(mantenimientos);
  } catch (error) {
    console.error("Error al obtener mantenimientos por periodo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los mantenimientos por periodo." });
  }
};

export const getEstadisticasMantenimientoController = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message:
          "Se requieren fechaInicio y fechaFin como parámetros de consulta.",
      });
    }

    const estadisticas = await getEstadisticasMantenimiento(
      fechaInicio,
      fechaFin
    );
    res.status(200).json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas de mantenimiento:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las estadísticas de mantenimiento." });
  }
};

export const getActivosMasMantenidosController = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message:
          "Se requieren fechaInicio y fechaFin como parámetros de consulta.",
      });
    }

    const activos = await getActivosMasMantenidos(fechaInicio, fechaFin);
    res.status(200).json(activos);
  } catch (error) {
    console.error("Error al obtener activos más mantenidos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los activos más mantenidos." });
  }
};

export const getDistribucionEstadosController = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message:
          "Se requieren fechaInicio y fechaFin como parámetros de consulta.",
      });
    }

    const distribucion = await getDistribucionEstados(fechaInicio, fechaFin);
    res.status(200).json(distribucion);
  } catch (error) {
    console.error("Error al obtener distribución de estados:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la distribución de estados." });
  }
};

export const getActividadesMasFrecuentesFechaController = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message:
          "Se requieren fechaInicio y fechaFin como parámetros de consulta.",
      });
    }

    const actividadesF = await getActividadesMasFrecuentesFecha(
      fechaInicio,
      fechaFin
    );
    res.status(200).json(actividadesF);
  } catch (error) {
    console.error(
      "Error al obtener las actividades mas frecuentes por fecha:",
      error
    );
    res.status(500).json({
      message: "Error al obtener las actividades mas frecuentes por fecha.",
    });
  }
};

export const getComponentesMasUsadosFechaController = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message:
          "Se requieren fechaInicio y fechaFin como parámetros de consulta.",
      });
    }

    const componentesF = await getComponentesMasUsadosFecha(
      fechaInicio,
      fechaFin
    );
    res.status(200).json(componentesF);
  } catch (error) {
    console.error(
      "Error al obtener los componentes mas usados por fecha:",
      error
    );
    res.status(500).json({
      message: "Error al obtener los componentes mas usados por fecha.",
    });
  }
};
