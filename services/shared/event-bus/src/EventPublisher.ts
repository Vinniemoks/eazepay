import { EventBus } from './EventBus';
import { Event } from './types';

export class EventPublisher {
  constructor(private eventBus: EventBus, private serviceName: string) {}

  async publish(type: string, data: any, metadata?: Record<string, any>): Promise<void> {
    const event: Event = {
      id: this.generateEventId(),
      type,
      timestamp: new Date().toISOString(),
      source: this.serviceName,
      data,
      metadata
    };

    await this.eventBus.publish(event);
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
