import express from 'express';
import { editActivo, getActivos,addActivosFromExcel,addActivoController,getActivo,updateActivoRelaciones } from '../controllers/activosController.js';


const router = express.Router();

router.get('/', getActivos);
router.put('/:id', editActivo); 
router.post('/excel', addActivosFromExcel);
router.post('/individual', addActivoController);
router.get('/getData/:id', getActivo); 
router.post('/update/:id', updateActivoRelaciones); 


export default router;



