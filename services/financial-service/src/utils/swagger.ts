import type { Express } from 'express';

type SwaggerOptions = {
  serviceName: string;
  serviceDescription?: string;
  version?: string;
  basePath?: string;
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  apiFiles?: string[];
};

export function setupSwagger(app: Express, options: SwaggerOptions) {
  // Minimal local stub: no-op to avoid alias dependency
  // In production, replace with actual swagger setup.
  void app;
  void options;
}

export default setupSwagger;