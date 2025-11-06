import amqp, { Channel, Connection } from 'amqplib';
import { EventBusConfig, Event } from './types';

export class EventBus {
  private connection?: Connection;
  private channel?: Channel;
  private config: EventBusConfig;
  private reconnectAttempts = 0;
  private isConnecting = false;

  constructor(config: EventBusConfig) {
    this.config = {
      exchange: 'afripay.events',
      exchangeType: 'topic',
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(
        this.config.exchange!,
        this.config.exchangeType!,
        { durable: true }
      );

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.handleConnectionError();
      });

      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed');
        this.handleConnectionError();
      });

      this.reconnectAttempts = 0;
      console.info('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.handleConnectionError();
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleConnectionError(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.info(`Reconnecting to RabbitMQ (attempt ${this.reconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.config.reconnectDelay);
  }

  async publish(event: Event): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus not connected');
    }

    const routingKey = event.type;
    const message = Buffer.from(JSON.stringify(event));

    this.channel.publish(
      this.config.exchange!,
      routingKey,
      message,
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now()
      }
    );
  }

  async subscribe(
    routingKey: string,
    queueName: string,
    handler: (event: Event) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus not connected');
    }

    const queue = await this.channel.assertQueue(queueName, {
      durable: true
    });

    await this.channel.bindQueue(
      queue.queue,
      this.config.exchange!,
      routingKey
    );

    await this.channel.prefetch(1);

    this.channel.consume(queue.queue, async (msg) => {
      if (!msg) return;

      try {
        const event: Event = JSON.parse(msg.content.toString());
        await handler(event);
        this.channel!.ack(msg);
      } catch (error) {
        console.error('Error processing event:', error);
        this.channel!.nack(msg, false, false);
      }
    });
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  isConnected(): boolean {
    return !!this.connection && !!this.channel;
  }
}
