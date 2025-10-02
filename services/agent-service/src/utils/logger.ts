import morgan from 'morgan';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

export const httpLogger = morgan('combined', { stream: accessLogStream });

export const logger = {
  info: (message: string, ...meta: unknown[]) => {
    console.log(`INFO: ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]) => {
    console.warn(`WARN: ${message}`, ...meta);
  },
  error: (message: string, ...meta: unknown[]) => {
    console.error(`ERROR: ${message}`, ...meta);
  }
};
