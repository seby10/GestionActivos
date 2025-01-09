import express from "express";
import {
    getActividadesFrecuentesController,
    getComponentesUsadosController,
    getRegistroMantenimientosController,
    getMantenimientosPorPeriodoController,
    getEstadisticasMantenimientoController,
    getActivosMasMantenidosController,
    getDistribucionEstadosController,
    getActividadesMasFrecuentesFechaController,
    getComponentesMasUsadosFechaController,
    getRegistroMantenimientosFechaController
} from "../controllers/estadisticasController.js";

const router = express.Router();

router.get("/actividadesFrec", getActividadesFrecuentesController);
router.get("/componentesUsados", getComponentesUsadosController);
router.get("/registroMantenimientos", getRegistroMantenimientosController);
router.get("/mantenimientosPorPeriodo", getMantenimientosPorPeriodoController);
router.get("/estadisticasMantenimiento", getEstadisticasMantenimientoController);
router.get("/activosMasMantenidos", getActivosMasMantenidosController);
router.get("/distribucionEstados", getDistribucionEstadosController);
router.get("/actividadesFecha", getActividadesMasFrecuentesFechaController);
router.get("/componentesFecha", getComponentesMasUsadosFechaController);
router.get("/registrosF", getRegistroMantenimientosFechaController);

export default router;