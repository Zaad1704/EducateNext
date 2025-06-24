// backend/routes/userRoutes.ts
import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware'; // Import authMiddleware

const router = Router();

router.get('/', authMiddleware, getUsers); // Apply authMiddleware here

export default router;
