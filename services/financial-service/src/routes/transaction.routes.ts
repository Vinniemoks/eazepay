// Transaction routes
import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middleware/auth';
import { validateTransaction } from '../middleware/validation';

const router = Router();
const controller = new TransactionController();

// All routes require authentication
router.use(authMiddleware);

// Record new transaction
router.post('/', validateTransaction, controller.recordTransaction.bind(controller));

// Search transactions
router.get('/search', controller.searchTransactions.bind(controller));

// Get transaction by ID
router.get('/:id', controller.getTransaction.bind(controller));

export default router;
