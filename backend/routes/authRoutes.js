// routes/userRoutes.js
import express from 'express';
import { getUserDetails, login, getUsersController, getUserByIdController } from '../controllers/authController.js';


const router = express.Router();

router.post('/login', login);
router.get('/getUser', getUserDetails);
router.get("/", getUsersController);
router.get("/:id", getUserByIdController);

export default router;

