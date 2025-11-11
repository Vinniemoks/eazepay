import { EventBus } from './EventBus';
import { Channel, ConsumeMessage } from 'amqplib';

export class EventSubscriber {
  private eventBus: EventBus;
  private serviceName: string;

  constructor(eventBus: EventBus, serviceName: string) {
    this.eventBus = eventBus;
    this.serviceName = serviceName;
  }

  public async subscribe(
    routingKey: string,
    handler: (event: any) => Promise<void>
  ): Promise<void> {
    const channel = this.eventBus.getChannel();
    const exchange = this.eventBus.getExchange();
    const queueName = `${this.serviceName}-${routingKey}`;

    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchange, routingKey);

    channel.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        await handler(event);
        channel.ack(msg);
      }
    });
    console.log(`[EventSubscriber] Subscribed to ${routingKey} on queue ${queueName}`);
  }
}