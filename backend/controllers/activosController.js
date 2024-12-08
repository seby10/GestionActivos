import {
  getAllActivos,
  getActivoByIdFromDB,
  updateActivo,
} from "../models/activosModel.js";

export const getActivos = async (req, res) => {
  try {
    const activos = await getAllActivos();
    res.status(200).json(activos);
  } catch (error) {
    console.error("Error al obtener los activos:", error);
    res.status(500).json({ message: "Error al obtener los activos." });
  }
};

export const getActivoById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "El ID del activo es obligatorio" });
  }

  try {
    const activo = await getActivoByIdFromDB(id);
    if (!activo) {
      return res
        .status(404)
        .json({ success: false, message: "Activo no encontrado" });
    }
    return res.status(200).json({ success: true, data: activo });
  } catch (error) {
    console.error("Error al obtener el activo por ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener el activo" });
  }
};

export const editActivo = async (req, res) => {
  const { id } = req.params;
  const activoData = req.body;

  try {
    const result = await updateActivo(id, activoData);

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
