import express from 'express';
import { editActivo, getActivos } from '../controllers/activosController.js';

const router = express.Router();

router.get('/', getActivos);
router.put('/:id', editActivo); 

export default router;



