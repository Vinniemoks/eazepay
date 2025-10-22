// Event Consumer - Listens to RabbitMQ for new transactions
import amqp from 'amqplib';
import { BlockchainClient } from './blockchain-client';

export class EventConsumer {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private blockchainClient: BlockchainClient;

  constructor(blockchainClient: BlockchainClient) {
    this.blockchainClient = blockchainClient;
  }

  async start(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
      
      // Connect to RabbitMQ
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchange and queue
      const exchange = 'eazepay.transactions';
      const queue = 'blockchain.transactions';

      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, 'transaction.*');

      console.log('✅ Event consumer started, listening for transactions...');

      // Consume messages
      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const transaction = JSON.parse(msg.content.toString());
            console.log(`📥 Received transaction: ${transaction.id}`);

            // Record on blockchain
            await this.blockchainClient.recordTransaction(transaction);
            
            // Acknowledge message
            this.channel!.ack(msg);
            console.log(`✅ Transaction ${transaction.id} recorded on blockchain`);
          } catch (error) {
            console.error('❌ Failed to process transaction:', error);
            // Reject and requeue
            this.channel!.nack(msg, false, true);
          }
        }
      });

      // Listen for audit logs
      const auditQueue = 'blockchain.audit-logs';
      await this.channel.assertQueue(auditQueue, { durable: true });
      await this.channel.bindQueue(auditQueue, exchange, 'audit.*');

      this.channel.consume(auditQueue, async (msg) => {
        if (msg) {
          try {
            const auditLog = JSON.parse(msg.content.toString());
            console.log(`📥 Received audit log: ${auditLog.id}`);

            await this.blockchainClient.recordAuditLog(auditLog);
            
            this.channel!.ack(msg);
            console.log(`✅ Audit log ${auditLog.id} recorded on blockchain`);
          } catch (error) {
            console.error('❌ Failed to process audit log:', error);
            this.channel!.nack(msg, false, true);
          }
        }
      });

    } catch (error) {
      console.error('❌ Failed to start event consumer:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log('Event consumer stopped');
  }
}
