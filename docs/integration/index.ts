import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const serviceName = process.env.SERVICE_NAME || 'eazepay-service';

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: `logs/${serviceName}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
});

const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
});

const transports = [];

if (process.env.NODE_ENV === 'production') {
  transports.push(fileRotateTransport);
} else {
  transports.push(consoleTransport);
  // Also log to file in development for history
  transports.push(new winston.transports.File({
      filename: `logs/dev-combined.log`,
      format: combine(timestamp(), json())
  }));
   transports.push(new winston.transports.File({
      filename: `logs/dev-error.log`,
      level: 'error',
      format: combine(errors({ stack: true }), timestamp(), json())
  }));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: serviceName },
  transports,
  exitOnError: false,
});

/**
 * Creates a child logger with additional metadata.
 * @param metadata - An object to be added to all log entries from this logger.
 * @returns A new logger instance.
 */
export const createChildLogger = (metadata: Record<string, any>): winston.Logger => {
    return logger.child(metadata);
};

export default logger;