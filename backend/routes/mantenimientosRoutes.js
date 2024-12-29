import express from "express";
import {
  addMantenimientoController,
  addDetallesMantenimientoController,
  getActivosByEstadoController,
  finalizarMantenimientoController,
  updateEstadoActivoController,
  updateEstadoMantenimientoActivoController,
  getMantenimientosController,
  getDetallesMantenimientoController,
} from "../controllers/mantenimientosController.js";

const router = express.Router();

router.get("/", getMantenimientosController);
router.get("/detalles/:id", getDetallesMantenimientoController);
router.post("/addMantenimiento", addMantenimientoController);
router.post("/addDetallesMantenimiento", addDetallesMantenimientoController);
router.get("/getActivosByEstado", getActivosByEstadoController);
router.put("/finalizar/:id", finalizarMantenimientoController);
router.put("/updateEstadoActivo/:id", updateEstadoActivoController);
router.put('/:activoId/finalizarAct', updateEstadoMantenimientoActivoController);

export default router;
