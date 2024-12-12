import { getAllProveedores } from "../models/proveedoresModel.js";

export const getProveedores = async (req, res) => {
  try {
    const proveedores = await getAllProveedores();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching proveedores" });
  }
};
