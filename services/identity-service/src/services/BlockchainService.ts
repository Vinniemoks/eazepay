// Blockchain Service for Identity Service
import axios from 'axios';
import { logger } from '../utils/logger';

export interface AuditLogBlockchainDTO {
  id: string;
  actionType: string;
  actorUserId: string;
  resourceType: string;
  resourceId: string;
  beforeValue: any;
  afterValue: any;
  timestamp: string;
}

export class BlockchainService {
  private blockchainServiceUrl: string;

  constructor() {
    this.blockchainServiceUrl = process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain-service:8020';
  }

  /**
   * Record audit log on blockchain asynchronously
   */
  async recordAuditLogAsync(auditLog: AuditLogBlockchainDTO): Promise<void> {
    // Don't await - fire and forget
    this.recordAuditLog(auditLog).catch(error => {
      logger.error('Failed to record audit log on blockchain:', error.message);
    });
  }

  /**
   * Record audit log on blockchain
   */
  async recordAuditLog(auditLog: AuditLogBlockchainDTO): Promise<string> {
    try {
      const response = await axios.post(
        `${this.blockchainServiceUrl}/api/blockchain/audit-logs`,
        auditLog,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      if (response.data && response.data.success) {
        const txHash = response.data.transactionHash;
        logger.info(`Audit log ${auditLog.id} recorded on blockchain with hash: ${txHash}`);
        return txHash;
      }

      throw new Error('Blockchain recording failed');
    } catch (error: any) {
      logger.error('Error recording audit log on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Verify audit log on blockchain
   */
  async verifyAuditLog(auditLogId: string, expectedHash: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.blockchainServiceUrl}/api/blockchain/verify/${auditLogId}`,
        { expectedHash },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return response.data && response.data.isValid;
    } catch (error: any) {
      logger.error('Error verifying audit log on blockchain:', error.message);
      return false;
    }
  }

  /**
   * Get audit log from blockchain
   */
  async getAuditLog(auditLogId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.blockchainServiceUrl}/api/blockchain/audit-logs/${auditLogId}`,
        {
          timeout: 5000
        }
      );

      return response.data && response.data.success ? response.data.auditLog : null;
    } catch (error: any) {
      logger.error('Error getting audit log from blockchain:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
