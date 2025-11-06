import { EventBus } from './EventBus';
import { Event, EventHandler } from './types';

export class EventSubscriber {
  constructor(private eventBus: EventBus, private serviceName: string) {}

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const queueName = `${this.serviceName}.${eventType}`;
    const routingKey = eventType;

    await this.eventBus.subscribe(routingKey, queueName, handler);
  }

  async subscribeToPattern(pattern: string, handler: EventHandler): Promise<void> {
    const queueName = `${this.serviceName}.${pattern.replace('*', 'all')}`;
    
    await this.eventBus.subscribe(pattern, queueName, handler);
  }
}
