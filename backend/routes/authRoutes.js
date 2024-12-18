// routes/userRoutes.js
import express from 'express';
import { getUserDetails, login } from '../controllers/authController.js';


const router = express.Router();

router.post('/login', login);
router.get('/get-userDetails', getUserDetails);

export default router;

