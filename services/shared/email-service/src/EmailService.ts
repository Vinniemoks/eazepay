import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfig, EmailOptions, EmailTemplate } from './types';
import { TemplateEngine } from './TemplateEngine';

export class EmailService {
  private transporter: Transporter;
  private templateEngine: TemplateEngine;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.templateEngine = new TemplateEngine(config.templatesDir);
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter based on configuration
   */
  private createTransporter(): Transporter {
    if (this.config.provider === 'smtp') {
      return nodemailer.createTransport({
        host: this.config.smtp?.host,
        port: this.config.smtp?.port || 587,
        secure: this.config.smtp?.secure || false,
        auth: {
          user: this.config.smtp?.user,
          pass: this.config.smtp?.password
        }
      });
    }

    if (this.config.provider === 'sendgrid') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: this.config.sendgrid?.apiKey
        }
      });
    }

    if (this.config.provider === 'mailgun') {
      return nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: this.config.mailgun?.username,
          pass: this.config.mailgun?.apiKey
        }
      });
    }

    // Development mode - log emails to console
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  /**
   * Send email with template
   */
  async sendTemplate(
    template: EmailTemplate,
    to: string | string[],
    data: Record<string, any>
  ): Promise<void> {
    const html = await this.templateEngine.render(template, data);
    const subject = this.getSubjectForTemplate(template, data);

    await this.send({
      to,
      subject,
      html
    });
  }

  /**
   * Send raw email
   */
  async send(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (this.config.provider === 'development') {
        console.log('📧 Email sent (development mode):');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Message:', info.message.toString());
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error}`);
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, token: string, name: string): Promise<void> {
    const verificationUrl = `${this.config.appUrl}/verify-email/${token}`;
    
    await this.sendTemplate('email-verification', to, {
      name,
      verificationUrl,
      appName: this.config.appName
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, token: string, name: string): Promise<void> {
    const resetUrl = `${this.config.appUrl}/reset-password/${token}`;
    
    await this.sendTemplate('password-reset', to, {
      name,
      resetUrl,
      appName: this.config.appName,
      expiryMinutes: 60
    });
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(to: string, otp: string, name: string): Promise<void> {
    await this.sendTemplate('otp', to, {
      name,
      otp,
      appName: this.config.appName,
      expiryMinutes: 10
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendTemplate('welcome', to, {
      name,
      appName: this.config.appName,
      loginUrl: `${this.config.appUrl}/login`
    });
  }

  /**
   * Send account locked email
   */
  async sendAccountLockedEmail(to: string, name: string, unlockTime: Date): Promise<void> {
    await this.sendTemplate('account-locked', to, {
      name,
      appName: this.config.appName,
      unlockTime: unlockTime.toLocaleString(),
      supportEmail: this.config.supportEmail
    });
  }

  /**
   * Send password changed email
   */
  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    await this.sendTemplate('password-changed', to, {
      name,
      appName: this.config.appName,
      supportEmail: this.config.supportEmail
    });
  }

  /**
   * Send new device login alert
   */
  async sendNewDeviceAlert(
    to: string,
    name: string,
    deviceInfo: { device: string; location: string; time: string }
  ): Promise<void> {
    await this.sendTemplate('new-device-login', to, {
      name,
      appName: this.config.appName,
      device: deviceInfo.device,
      location: deviceInfo.location,
      time: deviceInfo.time,
      supportEmail: this.config.supportEmail
    });
  }

  /**
   * Get subject for template
   */
  private getSubjectForTemplate(template: EmailTemplate, data: Record<string, any>): string {
    const subjects: Record<EmailTemplate, string> = {
      'email-verification': `Verify your ${this.config.appName} email`,
      'password-reset': `Reset your ${this.config.appName} password`,
      'otp': `Your ${this.config.appName} verification code`,
      'welcome': `Welcome to ${this.config.appName}!`,
      'account-locked': `Your ${this.config.appName} account has been locked`,
      'password-changed': `Your ${this.config.appName} password was changed`,
      'new-device-login': `New device login to your ${this.config.appName} account`
    };

    return subjects[template] || 'Notification';
  }

  /**
   * Verify email configuration
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration verification failed:', error);
      return false;
    }
  }
}
