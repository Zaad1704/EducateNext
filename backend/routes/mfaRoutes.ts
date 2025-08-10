// backend/routes/mfaRoutes.ts
import { Router } from 'express';
import { setupMFA, enableMFA, disableMFA } from '../middleware/mfa';
import { authMiddleware } from '../middleware/authMiddleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// All MFA routes require authentication
router.use(authMiddleware);

// Setup MFA (generate QR code)
router.post('/setup', setupMFA);

// Enable MFA (verify token and activate)
router.post('/enable', [
  body('token').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Token must be 6 digits'),
  handleValidationErrors
], enableMFA);

// Disable MFA (requires password and token)
router.post('/disable', [
  body('password').notEmpty().withMessage('Password is required'),
  body('token').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Token must be 6 digits'),
  handleValidationErrors
], disableMFA);

export default router;