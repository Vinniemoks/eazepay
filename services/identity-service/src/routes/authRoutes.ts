import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Use static methods directly
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-biometric', AuthController.verifyBiometric);
router.get('/auth-level/:phoneNumber', AuthController.getAuthLevel);

export { router as authRoutes };