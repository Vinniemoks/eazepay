import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, schemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validate(schemas.register), AuthController.register);
router.post('/login', validate(schemas.login), AuthController.login);
router.post('/refresh', validate(schemas.refreshToken), AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
