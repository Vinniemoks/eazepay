import { Router } from 'express';
import { MpesaController } from '../controllers/MpesaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initiate payment (requires authentication)
router.post('/initiate', authenticate, MpesaController.initiatePayment);

// Query transaction status
router.get('/query/:checkoutRequestId', authenticate, MpesaController.queryTransaction);

// Callback endpoint (no auth - called by M-Pesa)
router.post('/callback', MpesaController.handleCallback);

export default router;
