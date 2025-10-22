// Blockchain Service - Main Entry Point
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { BlockchainClient } from './blockchain-client';
import { EventConsumer } from './event-consumer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8020;

app.use(express.json());

// Initialize blockchain client
const blockchainClient = new BlockchainClient();
let eventConsumer: EventConsumer;

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'blockchain-service',
    timestamp: new Date().toISOString()
  });
});

// Record transaction on blockchain
app.post('/api/blockchain/transactions', async (req: Request, res: Response) => {
  try {
    const transaction = req.body;
    const txHash = await blockchainClient.recordTransaction(transaction);
    
    res.json({
      success: true,
      transactionHash: txHash,
      message: 'Transaction recorded on blockchain'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction from blockchain
app.get('/api/blockchain/transactions/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await blockchainClient.getTransaction(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify transaction integrity
app.post('/api/blockchain/verify/:id', async (req: Request, res: Response) => {
  try {
    const { expectedHash } = req.body;
    const isValid = await blockchainClient.verifyTransactionIntegrity(
      req.params.id,
      expectedHash
    );
    
    res.json({
      success: true,
      isValid,
      message: isValid ? 'Transaction is valid' : 'Transaction integrity compromised'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction history
app.get('/api/blockchain/accounts/:accountId/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = await blockchainClient.getTransactionHistory(
      req.params.accountId,
      limit
    );
    
    res.json({
      success: true,
      count: history.length,
      transactions: history
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    // Connect to blockchain
    await blockchainClient.connect();
    
    // Start event consumer (listens to RabbitMQ for new transactions)
    eventConsumer = new EventConsumer(blockchainClient);
    await eventConsumer.start();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🔗 Eazepay Blockchain Service                      ║
║                                                       ║
║   Version: 1.0.0                                     ║
║   Port: ${PORT}                                        ║
║   Blockchain: Connected ✅                            ║
║                                                       ║
║   Endpoints:                                         ║
║   - POST /api/blockchain/transactions                ║
║   - GET  /api/blockchain/transactions/:id            ║
║   - POST /api/blockchain/verify/:id                  ║
║   - GET  /api/blockchain/accounts/:id/history        ║
║   - GET  /health                                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start blockchain service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await blockchainClient.disconnect();
  await eventConsumer.stop();
  process.exit(0);
});

startServer();

export default app;
