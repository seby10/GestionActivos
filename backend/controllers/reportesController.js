import { getHistorialDB } from "../models/reportesModel.js";

export const getHistorial = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "ID de activo inválido." });
  }

  try {
    const historial = await getHistorialDB(id);

    res.status(200).json(historial); 
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    res.status(500).json({ message: "Error al obtener el historial." });
  }
};
