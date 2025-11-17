import { query, pool } from '../config/database';

export interface AgentFloat {
  agentId: string;
  balance: number;
  currency: string;
  lastTopupAt?: Date;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  customerId?: string;
  activityType: 'registration' | 'cash_in' | 'cash_out' | 'verification';
  amount?: number;
  currency: string;
  commission?: number;
  reference?: string;
  metadata?: any;
  createdAt: Date;
}

export interface AgentStatistics {
  agentId: string;
  customersRegistered: number;
  cashInCount: number;
  cashOutCount: number;
  totalVolume: number;
  todayVolume: number;
  thisWeekVolume: number;
  thisMonthVolume: number;
  totalCommission: number;
  lastActivityAt?: Date;
}

export class AgentModel {
  /**
   * Initialize agent float
   */
  static async initializeFloat(agentId: string, currency: string = 'KES'): Promise<AgentFloat> {
    const result = await query(
      'INSERT INTO agent_float (agent_id, currency) VALUES ($1, $2) ON CONFLICT (agent_id) DO NOTHING RETURNING *',
      [agentId, currency]
    );
    
    if (result.rows.length === 0) {
      // Already exists, fetch it
      const existing = await query('SELECT * FROM agent_float WHERE agent_id = $1', [agentId]);
      return this.mapToFloat(existing.rows[0]);
    }
    
    return this.mapToFloat(result.rows[0]);
  }

  /**
   * Get agent float balance
   */
  static async getFloat(agentId: string): Promise<AgentFloat | null> {
    const result = await query('SELECT * FROM agent_float WHERE agent_id = $1', [agentId]);
    return result.rows[0] ? this.mapToFloat(result.rows[0]) : null;
  }

  /**
   * Credit agent float (add money)
   */
  static async creditFloat(
    agentId: string,
    amount: number,
    category: string,
    reference: string,
    description?: string
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get float with lock
      const floatResult = await client.query(
        'SELECT * FROM agent_float WHERE agent_id = $1 FOR UPDATE',
        [agentId]
      );

      if (floatResult.rows.length === 0) {
        throw new Error('Agent float not found');
      }

      const float = floatResult.rows[0];
      const balanceBefore = parseFloat(float.balance);
      const balanceAfter = balanceBefore + amount;

      // Update balance
      await client.query(
        'UPDATE agent_float SET balance = $1, last_topup_at = CURRENT_TIMESTAMP WHERE agent_id = $2',
        [balanceAfter, agentId]
      );

      // Log transaction
      await client.query(
        `INSERT INTO agent_transactions 
         (agent_id, type, category, amount, balance_before, balance_after, reference, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [agentId, 'credit', category, amount, balanceBefore, balanceAfter, reference, description]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Debit agent float (remove money)
   */
  static async debitFloat(
    agentId: string,
    amount: number,
    category: string,
    reference: string,
    description?: string
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get float with lock
      const floatResult = await client.query(
        'SELECT * FROM agent_float WHERE agent_id = $1 FOR UPDATE',
        [agentId]
      );

      if (floatResult.rows.length === 0) {
        throw new Error('Agent float not found');
      }

      const float = floatResult.rows[0];
      const balanceBefore = parseFloat(float.balance);
      const balanceAfter = balanceBefore - amount;

      // Check sufficient balance
      if (balanceAfter < 0) {
        throw new Error('Insufficient agent float balance');
      }

      // Update balance
      await client.query(
        'UPDATE agent_float SET balance = $1 WHERE agent_id = $2',
        [balanceAfter, agentId]
      );

      // Log transaction
      await client.query(
        `INSERT INTO agent_transactions 
         (agent_id, type, category, amount, balance_before, balance_after, reference, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [agentId, 'debit', category, amount, balanceBefore, balanceAfter, reference, description]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log agent activity
   */
  static async logActivity(
    agentId: string,
    activityType: string,
    customerId?: string,
    amount?: number,
    commission?: number,
    reference?: string,
    metadata?: any
  ): Promise<void> {
    await query(
      `INSERT INTO agent_activities 
       (agent_id, customer_id, activity_type, amount, commission, reference, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [agentId, customerId, activityType, amount, commission, reference, JSON.stringify(metadata || {})]
    );

    // Update statistics
    await this.updateStatistics(agentId, activityType, amount || 0);
  }

  /**
   * Get agent statistics
   */
  static async getStatistics(agentId: string): Promise<AgentStatistics> {
    // Initialize if not exists
    await query(
      'INSERT INTO agent_statistics (agent_id) VALUES ($1) ON CONFLICT (agent_id) DO NOTHING',
      [agentId]
    );

    const result = await query(
      'SELECT * FROM agent_statistics WHERE agent_id = $1',
      [agentId]
    );

    return this.mapToStatistics(result.rows[0]);
  }

  /**
   * Get agent activities
   */
  static async getActivities(
    agentId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AgentActivity[]> {
    const result = await query(
      'SELECT * FROM agent_activities WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [agentId, limit, offset]
    );

    return result.rows.map(this.mapToActivity);
  }

  /**
   * Update agent statistics
   */
  private static async updateStatistics(
    agentId: string,
    activityType: string,
    amount: number
  ): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [agentId];
    let paramIndex = 2;

    if (activityType === 'registration') {
      updates.push('customers_registered = customers_registered + 1');
    } else if (activityType === 'cash_in') {
      updates.push('cash_in_count = cash_in_count + 1');
      updates.push(`total_volume = total_volume + $${paramIndex}`);
      updates.push(`today_volume = today_volume + $${paramIndex}`);
      updates.push(`this_week_volume = this_week_volume + $${paramIndex}`);
      updates.push(`this_month_volume = this_month_volume + $${paramIndex}`);
      params.push(amount);
      paramIndex++;
    } else if (activityType === 'cash_out') {
      updates.push('cash_out_count = cash_out_count + 1');
      updates.push(`total_volume = total_volume + $${paramIndex}`);
      updates.push(`today_volume = today_volume + $${paramIndex}`);
      updates.push(`this_week_volume = this_week_volume + $${paramIndex}`);
      updates.push(`this_month_volume = this_month_volume + $${paramIndex}`);
      params.push(amount);
      paramIndex++;
    }

    updates.push('last_activity_at = CURRENT_TIMESTAMP');

    if (updates.length > 0) {
      await query(
        `UPDATE agent_statistics SET ${updates.join(', ')} WHERE agent_id = $1`,
        params
      );
    }
  }

  // Mapping functions
  private static mapToFloat(row: any): AgentFloat {
    return {
      agentId: row.agent_id,
      balance: parseFloat(row.balance),
      currency: row.currency,
      lastTopupAt: row.last_topup_at
    };
  }

  private static mapToActivity(row: any): AgentActivity {
    return {
      id: row.id,
      agentId: row.agent_id,
      customerId: row.customer_id,
      activityType: row.activity_type,
      amount: row.amount ? parseFloat(row.amount) : undefined,
      currency: row.currency,
      commission: row.commission ? parseFloat(row.commission) : undefined,
      reference: row.reference,
      metadata: row.metadata,
      createdAt: row.created_at
    };
  }

  private static mapToStatistics(row: any): AgentStatistics {
    return {
      agentId: row.agent_id,
      customersRegistered: parseInt(row.customers_registered),
      cashInCount: parseInt(row.cash_in_count),
      cashOutCount: parseInt(row.cash_out_count),
      totalVolume: parseFloat(row.total_volume),
      todayVolume: parseFloat(row.today_volume),
      thisWeekVolume: parseFloat(row.this_week_volume),
      thisMonthVolume: parseFloat(row.this_month_volume),
      totalCommission: parseFloat(row.total_commission),
      lastActivityAt: row.last_activity_at
    };
  }
}
