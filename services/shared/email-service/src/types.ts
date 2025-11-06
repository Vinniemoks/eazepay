export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'development';
  from: string;
  appName: string;
  appUrl: string;
  supportEmail: string;
  templatesDir: string;
  
  // SMTP configuration
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  
  // SendGrid configuration
  sendgrid?: {
    apiKey: string;
  };
  
  // Mailgun configuration
  mailgun?: {
    apiKey: string;
    username: string;
    domain: string;
  };
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export type EmailTemplate = 
  | 'email-verification'
  | 'password-reset'
  | 'otp'
  | 'welcome'
  | 'account-locked'
  | 'password-changed'
  | 'new-device-login';
