import {
  getAllActivos,
  getActivoByIdFromDB,
  updateActivo,
  addActivo,
  fetchActivoData, 
  updateActivoRelacionesInDB 
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
  const activosValidos = [];
  const activosInvalidos = [];

  try {
    for (const activo of activos) {
      const { 
        COD_ACT, NOM_ACT, MAR_ACT, CAT_ACT, UBI_ACT, EST_ACT, ID_PRO, PC_ACT 
      } = activo;

      if (COD_ACT && NOM_ACT && CAT_ACT && UBI_ACT && EST_ACT && ID_PRO && PC_ACT) {
        try {
          const result = await addActivo({ 
            COD_ACT,
            NOM_ACT, 
            MAR_ACT: MAR_ACT || 'Desconocido',
            CAT_ACT, 
            UBI_ACT, 
            EST_ACT, 
            ID_PRO,
            PC_ACT
          });
          console.log(`Activo agregado con ID: ${result.insertId}`);
          activosValidos.push(activo);  // Solo si se agrega correctamente
        } catch (error) {
          console.log('Error al agregar el activo:', error.message);
          activosInvalidos.push(activo);  // Si hay error, agregarlo a los inválidos
        }
      } else {
        activosInvalidos.push(activo);  // Si falta algún campo, marcar como inválido
      }
    }

    if (activosValidos.length === 0) {
      return res.status(400).json({
        message: 'No se pudo agregar ningún activo válido.',
        activosValidos: activosValidos.length,
        activosInvalidos: activosInvalidos.length,
        detalles: {
          activosValidos: activosValidos,
          activosInvalidos: activosInvalidos
        }
      });
    }

    // Responder con la cantidad de activos válidos e inválidos solo si hay activos válidos
    res.status(200).json({
      message: 'Proceso de carga completado',
      activosValidos: activosValidos.length,
      activosInvalidos: activosInvalidos.length,
      detalles: {
        activosValidos: activosValidos,
        activosInvalidos: activosInvalidos
      }
    });
  } catch (error) {
    console.error('Error al cargar los activos:', error);
    res.status(500).json({ message: 'Hubo un error al cargar los activos', error: error.message });
  }
};


export const getActivo = async (req, res) => {
  const { id,idMant } = req.params;
  try {
      const data = await fetchActivoData(id,idMant);
      res.status(200).json(data);
  } catch (error) {
      console.error("Error al obtener datos del activo:", error);
      res.status(500).json({ message: "Error al obtener datos del activo." });
  }
};

export const updateActivoRelaciones = async (req, res) => {
  const { id } = req.params;
  const { actividadesSeleccionadas, componentesSeleccionados, observacionMantenimiento } = req.body;

  try {
      await updateActivoRelacionesInDB(id, actividadesSeleccionadas, componentesSeleccionados, observacionMantenimiento);
      res.status(200).send('Relaciones actualizadas correctamente');
  } catch (error) {
      console.error("Error al actualizar relaciones del activo:", error);
      res.status(500).json({ message: "Error al actualizar relaciones del activo." });
  }
};