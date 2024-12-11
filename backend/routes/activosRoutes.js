import express from 'express';
import { editActivo, getActivos,addActivosFromExcel,addActivoController } from '../controllers/activosController.js';


const router = express.Router();

router.get('/', getActivos);
router.put('/:id', editActivo); 
router.post('/excel', addActivosFromExcel);
router.post('/individual', addActivoController);

export default router;



