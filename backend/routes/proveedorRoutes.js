import express from 'express';
import { getProveedores } from '../controllers/proveedoresController.js';

const router = express.Router();

router.get('/', getProveedores);

export default router;
