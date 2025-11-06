import { EmailService } from '@afripay/email-service';
import path from 'path';
import { logger } from '../utils/logger';

const emailConfig = {
  provider: (process.env.EMAIL_PROVIDER || 'development') as any,
  from: process.env.EMAIL_FROM || 'noreply@afripay.com',
  appName: process.env.APP_NAME || 'AfriPay',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@afripay.com',
  templatesDir: path.join(__dirname, '..', 'templates', 'emails'),
  
  smtp: process.env.EMAIL_PROVIDER === 'smtp' ? {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!
  } : undefined,
  
  sendgrid: process.env.EMAIL_PROVIDER === 'sendgrid' ? {
    apiKey: process.env.SENDGRID_API_KEY!
  } : undefined,
  
  mailgun: process.env.EMAIL_PROVIDER === 'mailgun' ? {
    apiKey: process.env.MAILGUN_API_KEY!,
    username: process.env.MAILGUN_USERNAME!,
    domain: process.env.MAILGUN_DOMAIN!
  } : undefined
};

export const emailService = new EmailService(emailConfig);

// Verify email configuration on startup
emailService.verify()
  .then((isValid) => {
    if (isValid) {
      logger.info('✅ Email service configured successfully');
    } else {
      logger.warn('⚠️ Email service verification failed - emails may not send');
    }
  })
  .catch((error) => {
    logger.error('❌ Email service configuration error:', error);
  });

export default emailService;
