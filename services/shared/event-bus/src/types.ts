export interface EventBusConfig {
  url: string;
  exchange?: string;
  exchangeType?: 'topic' | 'direct' | 'fanout';
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface Event {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface EventHandler<T = any> {
  (event: Event<T>): Promise<void> | void;
}

export interface SubscriptionOptions {
  queue?: string;
  routingKey?: string;
  durable?: boolean;
  autoAck?: boolean;
  prefetch?: number;
}
