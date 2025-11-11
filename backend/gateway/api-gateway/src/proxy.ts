import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config';
import { Request } from 'express';

// Common onProxyReq handler to forward the correlation ID
const onProxyReq: Options['onProxyReq'] = (proxyReq, req, res) => {
  const correlationId = (req as Request).headers['x-correlation-id'];
  if (correlationId) {
    proxyReq.setHeader('x-correlation-id', correlationId);
  }
  // Log the outgoing request with correlation ID for debugging
  console.log(`[proxy] Forwarding request with cid=${correlationId} to ${proxyReq.path}`);
};

export const proxyRoutes = {
  auth: createProxyMiddleware({
    target: config.identityUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/',
    },
    onProxyReq,
    logLevel: 'silent', // Use custom logging in index.ts
  }),
  admin: createProxyMiddleware({
    target: config.identityUrl, // Assuming admin routes also go to identity service or a dedicated admin service
    changeOrigin: true,
    pathRewrite: {
      '^/api/admin': '/',
    },
    onProxyReq,
    logLevel: 'silent',
  }),
  transactions: createProxyMiddleware({
    target: config.transactionUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/transactions': '/',
    },
    onProxyReq,
    logLevel: 'silent',
  }),
  wallet: createProxyMiddleware({
    target: config.walletUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/wallet': '/',
    },
    onProxyReq,
    logLevel: 'silent',
  }),
  biometric: createProxyMiddleware({
    target: config.biometricUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/biometric': '/',
    },
    onProxyReq,
    logLevel: 'silent',
  }),
  // Add other proxy routes here as needed
};