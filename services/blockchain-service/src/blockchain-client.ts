// Blockchain Client for Hyperledger Fabric
import { Gateway, Wallets, Contract } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

export interface BlockchainTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT';
  amount: number;
  currency: string;
  fromAccount: string;
  toAccount: string;
  timestamp: Date;
  status: string;
  metadata: any;
}

export class BlockchainClient {
  private gateway: Gateway | null = null;
  private contract: Contract | null = null;

  async connect(): Promise<void> {
    try {
      // Load connection profile
      const ccpPath = path.resolve(__dirname, '..', 'connection-profile.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create wallet
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check if identity exists
      const identity = await wallet.get('eazepayUser');
      if (!identity) {
        throw new Error('Identity not found in wallet');
      }

      // Connect to gateway
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'eazepayUser',
        discovery: { enabled: true, asLocalhost: false }
      });

      // Get network and contract
      const network = await this.gateway.getNetwork('eazepay-channel');
      this.contract = network.getContract('transaction-ledger');

      console.log('✅ Connected to blockchain network');
    } catch (error) {
      console.error('❌ Failed to connect to blockchain:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.gateway) {
      this.gateway.disconnect();
      console.log('Disconnected from blockchain network');
    }
  }

  async recordTransaction(transaction: BlockchainTransaction): Promise<string> {
    if (!this.contract) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const result = await this.contract.submitTransaction(
        'CreateTransaction',
        transaction.id,
        transaction.type,
        transaction.amount.toString(),
        transaction.currency,
        transaction.fromAccount,
        transaction.toAccount,
        transaction.timestamp.toISOString(),
        transaction.status,
        JSON.stringify(transaction.metadata)
      );

      const txHash = result.toString();
      console.log(`✅ Transaction recorded on blockchain: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to record transaction:', error);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<BlockchainTransaction | null> {
    if (!this.contract) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetTransaction',
        transactionId
      );

      if (!result || result.length === 0) {
        return null;
      }

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('❌ Failed to get transaction:', error);
      return null;
    }
  }

  async verifyTransactionIntegrity(transactionId: string, expectedHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'VerifyTransaction',
        transactionId,
        expectedHash
      );

      return result.toString() === 'true';
    } catch (error) {
      console.error('❌ Failed to verify transaction:', error);
      return false;
    }
  }

  async getTransactionHistory(accountId: string, limit: number = 100): Promise<BlockchainTransaction[]> {
    if (!this.contract) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetTransactionHistory',
        accountId,
        limit.toString()
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return [];
    }
  }

  async recordAuditLog(auditLog: any): Promise<string> {
    if (!this.contract) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const timestamp = auditLog.timestamp instanceof Date ? 
        auditLog.timestamp.toISOString() : 
        auditLog.timestamp;

      const result = await this.contract.submitTransaction(
        'CreateAuditLog',
        auditLog.id,
        auditLog.actionType,
        auditLog.actorUserId,
        auditLog.resourceType,
        auditLog.resourceId,
        JSON.stringify(auditLog.beforeValue || {}),
        JSON.stringify(auditLog.afterValue || {}),
        timestamp
      );

      const txHash = result.toString();
      console.log(`✅ Audit log recorded on blockchain: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to record audit log:', error);
      throw error;
    }
  }

  async getAuditLog(auditLogId: string): Promise<any | null> {
    if (!this.contract) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetAuditLog',
        auditLogId
      );

      if (!result || result.length === 0) {
        return null;
      }

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('❌ Failed to get audit log:', error);
      return null;
    }
  }
}
