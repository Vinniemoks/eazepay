import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.API_GATEWAY_PORT || '8080', 10),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  identityUrl: process.env.IDENTITY_URL || 'http://localhost:8000',
  transactionUrl: process.env.TRANSACTION_URL || 'http://localhost:8002',
  walletUrl: process.env.WALLET_URL || 'http://localhost:8003',
  biometricUrl: process.env.BIOMETRIC_URL || 'http://localhost:8001',
};