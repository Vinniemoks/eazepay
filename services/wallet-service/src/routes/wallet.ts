import { Router } from 'express';
import { WalletController } from '../controllers/WalletController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/create', WalletController.createWallet);
router.get('/balance', WalletController.getBalance);
router.get('/transactions', WalletController.getTransactions);
router.post('/topup', WalletController.topup);
router.post('/payment', WalletController.payment);

export default router;
