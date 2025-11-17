import { Router } from 'express';
import { AgentController, uploadMiddleware } from '../controllers/AgentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Agent-only routes
router.use(authorize('agent', 'admin'));

// Register customer with biometrics
router.post('/register-customer', uploadMiddleware, AgentController.registerCustomer);

// Verify customer
router.post('/verify-customer', uploadMiddleware, AgentController.verifyCustomer);

// Cash-in transaction
router.post('/cash-in', uploadMiddleware, AgentController.cashIn);

// Cash-out transaction
router.post('/cash-out', uploadMiddleware, AgentController.cashOut);

// Get agent statistics
router.get('/stats', AgentController.getStats);

// Get agent transactions
router.get('/transactions', AgentController.getTransactions);

export default router;
