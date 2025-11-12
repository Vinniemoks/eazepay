type Provider = 'development' | 'smtp' | 'sendgrid' | 'mailgun';

interface EmailConfig {
  provider: Provider;
  from: string;
  appName: string;
  appUrl: string;
  supportEmail: string;
  templatesDir?: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  sendgrid?: { apiKey: string };
  mailgun?: { apiKey: string; username: string; domain: string };
}

export class EmailService {
  private readonly config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async verify(): Promise<boolean> {
    // In development, always report true. For other providers, ensure minimal config.
    switch (this.config.provider) {
      case 'development':
        return true;
      case 'smtp':
        return !!(this.config.smtp && this.config.smtp.host && this.config.smtp.user);
      case 'sendgrid':
        return !!(this.config.sendgrid && this.config.sendgrid.apiKey);
      case 'mailgun':
        return !!(this.config.mailgun && this.config.mailgun.apiKey && this.config.mailgun.domain);
      default:
        return false;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const subject = `Welcome to ${this.config.appName}!`;
    const body = `Hi ${fullName},\n\nWelcome to ${this.config.appName}. We're glad you're here!\n\nIf you need help, contact ${this.config.supportEmail}.`;
    await this.dispatch(email, subject, body);
  }

  async sendPasswordResetEmail(email: string, resetToken: string, fullName: string): Promise<void> {
    const resetUrl = `${this.config.appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const subject = `${this.config.appName} Password Reset`;
    const body = `Hi ${fullName},\n\nWe received a request to reset your password.\nUse this link: ${resetUrl}\nIf you didn't request this, please ignore this email or contact ${this.config.supportEmail}.`;
    await this.dispatch(email, subject, body);
  }

  async sendOTPEmail(email: string, otp: string, fullName: string): Promise<void> {
    const subject = `${this.config.appName} Verification Code`;
    const body = `Hi ${fullName},\n\nYour verification code is: ${otp}\nIt expires in 10 minutes.`;
    await this.dispatch(email, subject, body);
  }

  private async dispatch(to: string, subject: string, body: string): Promise<void> {
    // For now, implement a simple logger-based sender for all providers to avoid adding deps.
    // This can be replaced later with Nodemailer/SendGrid/Mailgun SDKs.
    const provider = this.config.provider || 'development';
    const from = this.config.from;
    // eslint-disable-next-line no-console
    console.log(`[Email:${provider}]`, { from, to, subject, body });
  }
}

export default EmailService;