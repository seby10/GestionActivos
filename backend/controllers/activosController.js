import {
  getAllActivos,
  getActivoByIdFromDB,
  updateActivo,
  addActivo,
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

export const addActivoController = async (req, res) => {
  const {COD_ACT, NOM_ACT, MAR_ACT, CAT_ACT, UBI_ACT, EST_ACT, ID_PRO, PC_ACT } = req.body;
  try {
    const result = await addActivo({COD_ACT, NOM_ACT, MAR_ACT, CAT_ACT, UBI_ACT, EST_ACT, ID_PRO, PC_ACT });
    console.log(`Activo agregado con ID: ${result.id}`);

    res.status(200).json({ message: 'Activo agregado correctamente', id: result.id });
  } catch (error) {
    console.error('Error al agregar el activo:', error);
    res.status(500).json({ message: 'Hubo un error al agregar el activo', error: error.message });
  }
};


export const addActivosFromExcel = async (req, res) => {
  console.log('Archivo recibido:', req.body);
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({ message: 'El archivo Excel no contiene datos válidos.' });
  }
  const activos = req.body;
  try {
    for (const activo of activos) {
      const { 
        COD_ACT,
        NOM_ACT, 
        MAR_ACT, 
        CAT_ACT, 
        UBI_ACT, 
        EST_ACT, 
        ID_PRO, 
        PC_ACT 
      } = activo;
      const result = await addActivo({ 
        COD_ACT,
        NOM_ACT, 
        MAR_ACT, 
        CAT_ACT, 
        UBI_ACT, 
        EST_ACT, 
        ID_PRO,
        PC_ACT
      });
      console.log(result);
      console.log(`Activo agregado con ID: ${result.id}`);
    }
    res.status(200).json({ message: 'Activos cargados correctamente' });
  } catch (error) {
    console.error('Error al cargar los activos:', error);
    res.status(500).json({ message: 'Hubo un error al cargar los activos', error: error.message });
  }
};
