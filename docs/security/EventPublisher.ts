import { EventBus } from './EventBus';
import { EventType } from './events';

export class EventPublisher {
  private eventBus: EventBus;
  private serviceName: string;

  constructor(eventBus: EventBus, serviceName: string) {
    this.eventBus = eventBus;
    this.serviceName = serviceName;
  }

  public async publish(eventType: EventType, payload: object): Promise<void> {
    const channel = this.eventBus.getChannel();
    const exchange = this.eventBus.getExchange();

    const event = {
      metadata: {
        type: eventType,
        source: this.serviceName,
        timestamp: new Date().toISOString(),
      },
      data: payload,
    };

    channel.publish(exchange, eventType, Buffer.from(JSON.stringify(event)), { persistent: true });
    console.log(`[EventPublisher] Published event: ${eventType}`);
  }
}