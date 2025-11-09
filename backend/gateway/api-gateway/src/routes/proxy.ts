import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';

export const proxyRoutes = {
  auth: createProxyMiddleware({
    target: config.identityUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/api/auth' },
  }),
  admin: createProxyMiddleware({
    target: config.identityUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/admin': '/api/admin' },
  }),
  transactions: createProxyMiddleware({
    target: config.transactionUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/transactions': '/api/transactions' },
  }),
  wallet: createProxyMiddleware({
    target: config.walletUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/wallet': '/api/wallet' },
  }),
  biometric: createProxyMiddleware({
    target: config.biometricUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/biometric': '/' },
  }),
};