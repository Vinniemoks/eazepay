const fs = require('fs');
const path = require('path');
const http = require('http');
const app = require('./index');

const envPath = path.resolve(__dirname, '.env');

try {
  const envContents = fs.readFileSync(envPath, 'utf8');
  envContents.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && value && !Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  });
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.warn(`Failed to load .env file: ${error.message}`);
  }
}

const logger = require('./utils/logger');

const logger = require('./utils/logger');

const PORT = process.env.PORT || 8004;
const server = http.createServer(app);
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10);
const HEADERS_TIMEOUT_MS = parseInt(process.env.HEADERS_TIMEOUT_MS || '35000', 10);
const KEEP_ALIVE_TIMEOUT_MS = parseInt(process.env.KEEP_ALIVE_TIMEOUT_MS || '5000', 10);
server.requestTimeout = REQUEST_TIMEOUT_MS;
server.headersTimeout = HEADERS_TIMEOUT_MS;
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS;
server.listen(PORT, () => {
  logger.info('USSD Service started', { port: PORT });
});
