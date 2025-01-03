import {
  addDetallesMantenimiento,
  addMantenimiento,
  finalizarMantenimiento,
  finalizarMantenimientoActivo,
  getActivosByEstado,
  getActivosByEstadoD,
  getDetallesMantenimiento,
  getMantenimientos,
  updateActivoEstado,
  updateActivoEstadoD,
  removeAssetFromMaintenance,
  canRemoveAssetFromMaintenance,
} from "../models/mantenimientosModel.js";

export const addMantenimientoController = async (req, res) => {
  const { codigo, descripcion, fecha, tecnico, tipoTecnico } = req.body;
  try {
    const result = await addMantenimiento({
      codigo,
      descripcion,
      fecha,
      tecnico,
      tipoTecnico,
    });
    res
      .status(200)
      .json({ message: "Mantenimiento agregado correctamente", id: result.id });
  } catch (error) {
    console.error("Error al agregar el mantenimiento:", error);
    // Manejar errores específicos
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: "El código de mantenimiento ya existe",
        error: error.message,
      });
    }
    if (error.message.includes("fecha")) {
      return res.status(400).json({
        message: "La fecha proporcionada no es válida",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Hubo un error al agregar el mantenimiento",
      error: error.message,
    });
  }
};


export const finalizarMantenimientoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await finalizarMantenimiento(id);
    res.status(200).json({
      message: "Mantenimiento y activos asociados actualizados correctamente",
    });
  } catch (error) {
    console.error("Error al finalizar el mantenimiento:", error);
    if (
      error.message.includes("no existe") ||
      error.message.includes("ya está finalizado")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "Hubo un error al finalizar el mantenimiento",
      error: error.message,
    });
  }
};

export const addDetallesMantenimientoController = async (req, res) => {
  const { id_act, id_mant_per } = req.body;
  try {
    const result = await addDetallesMantenimiento({ id_act, id_mant_per });
    res.status(200).json({
      message: "Detalle de mantenimiento agregado correctamente",
      id: result.id,
    });
  } catch (error) {
    console.error("Error al agregar el detalle de mantenimiento:", error);
    if (
      error.message.includes("no existe") ||
      error.message.includes("ya se encuentra en mantenimiento")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "Hubo un error al agregar el detalle de mantenimiento",
      error: error.message,
    });
  }
};

export const getActivosByEstadoController = async (req, res) => {
  try {
    const activos = await getActivosByEstado();
    res.status(200).json(activos);
  } catch (error) {
    console.error("Error al obtener los activos:", error);
    res.status(500).json({ message: "Error al obtener los activos." });
  }
};


export const getActivosByEstadoControllerD = async (req, res) => {
  try {
    const activos = await getActivosByEstadoD();
    res.status(200).json(activos);
  } catch (error) {
    console.error("Error al obtener los activos:", error);
    res.status(500).json({ message: "Error al obtener los activos." });
  }
};

export const getMantenimientosController = async (req, res) => {
  try {
    const activos = await getMantenimientos();
    res.status(200).json(activos);
  } catch (error) {
    console.error("Error al obtener los mantenimientos:", error);
    res.status(500).json({ message: "Error al obtener los mantenimientos." });
  }
};

export const getDetallesMantenimientoController = async (req, res) => {
  const { id } = req.params;
  try {
    const detalles = await getDetallesMantenimiento(id);
    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener los detalles del mantenimiento:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los detalles del mantenimiento." });
  }
};

export const updateEstadoActivoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await updateActivoEstado(id);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Activo not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Activo updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating activo" });
  }
};

export const updateEstadoActivoControllerD = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await updateActivoEstadoD(id);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Activo not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Activo updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating activo" });
  }
};

export const updateEstadoMantenimientoActivoController = async (req, res) => {
  const { activoId } = req.params;
  try {
    // Llamar a la función del modelo para finalizar el mantenimiento
    const result = await finalizarMantenimientoActivo(activoId);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Activo no encontrado o ya finalizado" });
    }

    res
      .status(200)
      .json({ success: true, message: "Mantenimiento finalizado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al finalizar mantenimiento" });
  }
};

export const canRemoveAssetFromMaintenanceController = async (req, res) => {
  const { maintenanceId, assetId } = req.params;
  try {
    const canRemove = await canRemoveAssetFromMaintenance(maintenanceId, assetId);
    res.status(200).json({ canRemove });
  } catch (error) {
    console.error("Error checking if asset can be removed:", error);
    res.status(500).json({ error: "Error al verificar si el activo puede ser eliminado" });
  }
};

export const removeAssetFromMaintenanceController = async (req, res) => {
  const { maintenanceId, assetId } = req.params;
  try {
    const canRemove = await canRemoveAssetFromMaintenance(maintenanceId, assetId);
    if (!canRemove) {
      return res.status(400).json({ error: "No se puede eliminar este activo porque tiene actividades o componentes asociados." });
    }
    await removeAssetFromMaintenance(maintenanceId, assetId);
    res.status(200).json({ message: "Activo eliminado del mantenimiento exitosamente" });
  } catch (error) {
    console.error("Error removing asset from maintenance:", error);
    res.status(500).json({ error: "Error al eliminar el activo del mantenimiento" });
  }
};


export const updateMaintenanceController = async (req, res) => {
  const maintenance = req.body;
  try {
      const updatedMaintenance = await updateMaintenance(maintenance);
      res.status(200).json(updatedMaintenance);
  } catch (error) {
      console.error("Error updating maintenance:", error);
      res.status(500).json({ error: "Error updating maintenance" });
  }
};
