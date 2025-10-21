// Background job to auto-expire access requests
// Task: 4.6 - Implement auto-expiry and escalation
// Requirements: 17.1, 17.2

import { AppDataSource } from '../config/database';
import { AccessRequest, RequestStatus } from '../models/AccessRequest';
import { AuditLog, AuditActionType } from '../models/AuditLog';
import { generateCorrelationId } from '../utils/security';
import { LessThan } from 'typeorm';

export class AccessRequestExpiryJob {
  // Run every hour
  static async run(): Promise<void> {
    try {
      console.log('[Job] Running access request expiry check...');

      const requestRepo = AppDataSource.getRepository(AccessRequest);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Find all pending requests that have expired
      const expiredRequests = await requestRepo.find({
        where: {
          status: RequestStatus.PENDING,
          expiresAt: LessThan(new Date())
        },
        relations: ['requester', 'targetUser']
      });

      if (expiredRequests.length === 0) {
        console.log('[Job] No expired requests found');
        return;
      }

      console.log(`[Job] Found ${expiredRequests.length} expired requests`);

      // Expire each request
      for (const request of expiredRequests) {
        const beforeValue = { ...request };
        request.status = RequestStatus.EXPIRED;
        await requestRepo.save(request);

        // Audit log
        await auditRepo.save({
          timestamp: new Date(),
          actorUserId: 'SYSTEM',
          actorRole: 'SYSTEM' as any,
          actionType: AuditActionType.ACCESS_REQUEST_REJECTED,
          resourceType: 'ACCESS_REQUEST',
          resourceId: request.id,
          correlationId: generateCorrelationId(),
          entryHash: '',
          beforeValue,
          afterValue: request,
          metadata: { 
            reason: 'Auto-expired after 7 days',
            autoExpired: true
          }
        });

        // TODO: Send notification to requester
        // TODO: Escalate to superuser's manager if configured

        console.log(`[Job] Expired request ${request.id}`);
      }

      console.log(`[Job] Successfully expired ${expiredRequests.length} requests`);
    } catch (error) {
      console.error('[Job] Error expiring access requests:', error);
    }
  }

  // Start the job scheduler
  static startScheduler(): void {
    // Run immediately on start
    this.run();

    // Run every hour
    setInterval(() => {
      this.run();
    }, 60 * 60 * 1000); // 1 hour

    console.log('[Job] Access request expiry scheduler started (runs every hour)');
  }
}
