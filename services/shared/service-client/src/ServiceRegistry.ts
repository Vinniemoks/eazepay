import { ServiceEndpoint } from './types';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceEndpoint> = new Map();

  private constructor() {
    this.initializeDefaultServices();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  private initializeDefaultServices(): void {
    const isDocker = process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'production';
    const protocol = process.env.SERVICE_PROTOCOL || 'http';

    // Core services
    this.register({
      name: 'identity-service',
      url: process.env.IDENTITY_SERVICE_URL || 
           (isDocker ? `${protocol}://identity-service:8000` : `${protocol}://localhost:8000`),
      healthCheck: '/health'
    });

    this.register({
      name: 'biometric-service',
      url: process.env.BIOMETRIC_SERVICE_URL || 
           (isDocker ? `${protocol}://biometric-service-python:8001` : `${protocol}://localhost:8001`),
      healthCheck: '/health'
    });

    this.register({
      name: 'transaction-service',
      url: process.env.TRANSACTION_SERVICE_URL || 
           (isDocker ? `${protocol}://transaction-service-java:8002` : `${protocol}://localhost:8002`),
      healthCheck: '/health'
    });

    this.register({
      name: 'wallet-service',
      url: process.env.WALLET_SERVICE_URL || 
           (isDocker ? `${protocol}://wallet-service-go:8003` : `${protocol}://localhost:8003`),
      healthCheck: '/health'
    });

    this.register({
      name: 'ussd-service',
      url: process.env.USSD_SERVICE_URL || 
           (isDocker ? `${protocol}://ussd-service:8004` : `${protocol}://localhost:8004`),
      healthCheck: '/health'
    });

    this.register({
      name: 'agent-service',
      url: process.env.AGENT_SERVICE_URL || 
           (isDocker ? `${protocol}://agent-service:8005` : `${protocol}://localhost:8005`),
      healthCheck: '/health'
    });

    this.register({
      name: 'financial-service',
      url: process.env.FINANCIAL_SERVICE_URL || 
           (isDocker ? `${protocol}://financial-service:3002` : `${protocol}://localhost:3002`),
      healthCheck: '/health'
    });

    this.register({
      name: 'blockchain-service',
      url: process.env.BLOCKCHAIN_SERVICE_URL || 
           (isDocker ? `${protocol}://blockchain-service:8010` : `${protocol}://localhost:8010`),
      healthCheck: '/health'
    });

    this.register({
      name: 'iot-service',
      url: process.env.IOT_SERVICE_URL || 
           (isDocker ? `${protocol}://iot-service:8020` : `${protocol}://localhost:8020`),
      healthCheck: '/health'
    });

    this.register({
      name: 'robotics-service',
      url: process.env.ROBOTICS_SERVICE_URL || 
           (isDocker ? `${protocol}://robotics-service:8040` : `${protocol}://localhost:8040`),
      healthCheck: '/health'
    });
  }

  register(service: ServiceEndpoint): void {
    this.services.set(service.name, service);
  }

  get(serviceName: string): ServiceEndpoint | undefined {
    return this.services.get(serviceName);
  }

  getUrl(serviceName: string): string {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in registry`);
    }
    return service.url;
  }

  list(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  exists(serviceName: string): boolean {
    return this.services.has(serviceName);
  }
}
