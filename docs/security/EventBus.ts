import amqp, { Connection, Channel } from 'amqplib';

export interface EventBusConfig {
  url: string;
  exchange: string;
}

export class EventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private config: EventBusConfig;

  constructor(config: EventBusConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    if (this.connection) return;

    try {
      console.log('[EventBus] Connecting to RabbitMQ...');
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.config.exchange, 'topic', { durable: true });
      console.log('[EventBus] Connected and exchange asserted.');

      this.connection.on('error', (err) => {
        console.error('[EventBus] Connection error', err);
        this.reconnect();
      });

      this.connection.on('close', () => {
        console.warn('[EventBus] Connection closed. Attempting to reconnect...');
        this.reconnect();
      });

    } catch (error) {
      console.error('[EventBus] Failed to connect', error);
      this.reconnect();
    }
  }

  private reconnect(): void {
    this.connection = null;
    this.channel = null;
    setTimeout(() => this.connect(), 5000); // Reconnect after 5 seconds
  }

  public getChannel(): Channel {
    if (!this.channel) {
      throw new Error('EventBus channel is not available. Ensure connect() was called and successful.');
    }
    return this.channel;
  }

  public getExchange(): string {
    return this.config.exchange;
  }

  public async close(): Promise<void> {
    await this.connection?.close();
  }
}