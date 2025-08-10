import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';
import { authRateLimit } from '../middleware/security';

const router = Router();

// Apply strict rate limiting to auth routes
router.use(authRateLimit);

// Registration with validation
router.post('/register', validateUserRegistration, registerUser);

// Login with validation
router.post('/login', validateUserLogin, loginUser);

export default router;