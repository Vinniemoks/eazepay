// Blockchain Service - Main Entry Point (Mock Mode)
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8030;

app.use(express.json());

// Mock blockchain storage (in-memory for now)
const blockchainLedger = new Map<string, any>();
const auditLogs = new Map<string, any>();

console.log('🔗 Starting Blockchain Service in MOCK mode');
console.log('⚠️  For production, configure Hyperledger Fabric');

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'blockchain-service',
    timestamp: new Date().toISOString(),
    mode: 'mock',
    ledgerSize: blockchainLedger.size,
    auditLogsSize: auditLogs.size
  });
});

// Record transaction on blockchain
app.post('/api/blockchain/transactions', async (req: Request, res: Response) => {
  try {
    const transaction = req.body;
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    
    // Store in mock ledger
    blockchainLedger.set(transaction.transactionId || txHash, {
      ...transaction,
      blockchainHash: txHash,
      timestamp: new Date().toISOString(),
      blockNumber: blockchainLedger.size + 1
    });
    
    console.log(`✅ Transaction recorded: ${transaction.transactionId || txHash}`);
    
    res.json({
      success: true,
      transactionHash: txHash,
      blockNumber: blockchainLedger.size,
      message: 'Transaction recorded on blockchain (mock mode)'
    });
  } catch (error: any) {
    console.error('❌ Transaction recording failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction from blockchain
app.get('/api/blockchain/transactions/:id', async (req: Request, res: Response) => {
  try {
    const transaction = blockchainLedger.get(req.params.id);
    
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
app.post('/api/blockchain/transactions/:id/verify', async (req: Request, res: Response) => {
  try {
    const transaction = blockchainLedger.get(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    const { expectedHash } = req.body;
    const isValid = transaction.blockchainHash === expectedHash;
    
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

// Get transaction history for account
app.get('/api/blockchain/accounts/:accountId/history', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const history = Array.from(blockchainLedger.values())
      .filter((tx: any) => 
        tx.fromAccount === accountId || tx.toAccount === accountId
      )
      .slice(0, limit);
    
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

// Record audit log on blockchain
app.post('/api/blockchain/audit-logs', async (req: Request, res: Response) => {
  try {
    const auditLog = req.body;
    const logHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    
    auditLogs.set(auditLog.id || logHash, {
      ...auditLog,
      blockchainHash: logHash,
      timestamp: new Date().toISOString(),
      blockNumber: auditLogs.size + 1
    });
    
    console.log(`✅ Audit log recorded: ${auditLog.id || logHash}`);
    
    res.json({
      success: true,
      transactionHash: logHash,
      message: 'Audit log recorded on blockchain (mock mode)'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get audit log from blockchain
app.get('/api/blockchain/audit-logs/:id', async (req: Request, res: Response) => {
  try {
    const auditLog = auditLogs.get(req.params.id);
    
    if (!auditLog) {
      return res.status(404).json({
        success: false,
        error: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      auditLog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all transactions (for testing)
app.get('/api/blockchain/transactions', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const transactions = Array.from(blockchainLedger.values()).slice(0, limit);
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🔗 Eazepay Blockchain Service                      ║
║                                                       ║
║   Version: 1.0.0                                     ║
║   Port: ${PORT}                                        ║
║   Mode: MOCK (In-Memory) ⚠️                           ║
║                                                       ║
║   Endpoints:                                         ║
║   - POST /api/blockchain/transactions                ║
║   - GET  /api/blockchain/transactions/:id            ║
║   - POST /api/blockchain/transactions/:id/verify     ║
║   - GET  /api/blockchain/accounts/:id/history        ║
║   - POST /api/blockchain/audit-logs                  ║
║   - GET  /api/blockchain/audit-logs/:id              ║
║   - GET  /health                                     ║
║                                                       ║
║   ⚠️  Note: Using in-memory storage                   ║
║   For production, configure Hyperledger Fabric       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
