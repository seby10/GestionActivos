import express from 'express';
import { getHistorial } from '../controllers/reportesController.js';

const router = express.Router();

router.get('/historial/:id', getHistorial);

export default router;