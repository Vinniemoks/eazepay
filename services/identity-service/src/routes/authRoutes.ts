import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/biometric-auth', authController.authenticateWithBiometric.bind(authController));
router.get('/auth-level/:phoneNumber', authController.getAuthLevel.bind(authController));

export { router as authRoutes };
