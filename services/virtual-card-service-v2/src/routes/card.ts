import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create virtual card
router.post('/create', CardController.createCard);

// Get user's cards
router.get('/list', CardController.listCards);

// Get card details
router.get('/:cardId', CardController.getCardDetails);

// Get card balance
router.get('/:cardId/balance', CardController.getBalance);

// Top up card
router.post('/:cardId/topup', CardController.topUpCard);

// Get card transactions
router.get('/:cardId/transactions', CardController.getTransactions);

// Freeze/unfreeze card
router.post('/:cardId/freeze', CardController.freezeCard);
router.post('/:cardId/unfreeze', CardController.unfreezeCard);

// Cancel card
router.post('/:cardId/cancel', CardController.cancelCard);

export default router;
