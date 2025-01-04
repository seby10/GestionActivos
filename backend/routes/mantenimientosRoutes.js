import express from "express";
import {
  addMantenimientoController,
  addDetallesMantenimientoController,
  getActivosByEstadoController,
  getActivosByEstadoControllerD,
  finalizarMantenimientoController,
  updateEstadoActivoController,
  updateEstadoMantenimientoActivoController,
  getMantenimientosController,
  getDetallesMantenimientoController,
  updateEstadoActivoControllerD,
  canRemoveAssetFromMaintenanceController,
  removeAssetFromMaintenanceController,
  updateMaintenanceController,
} from "../controllers/mantenimientosController.js";

const router = express.Router();

router.get("/", getMantenimientosController);
router.get("/detalles/:id", getDetallesMantenimientoController);
router.post("/addMantenimiento", addMantenimientoController);
router.post("/addDetallesMantenimiento", addDetallesMantenimientoController);
router.get("/getActivosByEstado", getActivosByEstadoController);
router.get("/getActivosByEstadoD", getActivosByEstadoControllerD);
router.put("/finalizar/:id", finalizarMantenimientoController);
router.put("/updateEstadoActivo/:id", updateEstadoActivoController);
router.put("/updateEstadoActivoD/:id", updateEstadoActivoControllerD);
router.put('/:activoId/finalizarAct', updateEstadoMantenimientoActivoController);
router.get('/:maintenanceId/assets/:assetId/canRemove', canRemoveAssetFromMaintenanceController);
router.delete('/:maintenanceId/assets/:assetId', removeAssetFromMaintenanceController);
router.put('/:maintenanceId', updateMaintenanceController);

export default router;
