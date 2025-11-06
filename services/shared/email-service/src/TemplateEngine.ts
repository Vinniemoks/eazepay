import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import { EmailTemplate } from './types';

export class TemplateEngine {
  private templatesDir: string;
  private cache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    Handlebars.registerHelper('year', () => new Date().getFullYear());
    
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString();
    });
    
    Handlebars.registerHelper('uppercase', (str: string) => {
      return str.toUpperCase();
    });
  }

  /**
   * Render template with data
   */
  async render(template: EmailTemplate, data: Record<string, any>): Promise<string> {
    const compiled = await this.getTemplate(template);
    return compiled(data);
  }

  /**
   * Get compiled template (with caching)
   */
  private async getTemplate(template: EmailTemplate): Promise<HandlebarsTemplateDelegate> {
    if (this.cache.has(template)) {
      return this.cache.get(template)!;
    }

    const templatePath = path.join(this.templatesDir, `${template}.hbs`);
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = Handlebars.compile(templateContent);
      this.cache.set(template, compiled);
      return compiled;
    } catch (error) {
      // If template file doesn't exist, use default template
      console.warn(`Template ${template} not found, using default`);
      return this.getDefaultTemplate(template);
    }
  }

  /**
   * Get default template if file doesn't exist
   */
  private getDefaultTemplate(template: EmailTemplate): HandlebarsTemplateDelegate {
    const defaultTemplates: Record<EmailTemplate, string> = {
      'email-verification': `
        <h2>Verify Your Email</h2>
        <p>Hi {{name}},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="{{verificationUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy this link: {{verificationUrl}}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `,
      'password-reset': `
        <h2>Reset Your Password</h2>
        <p>Hi {{name}},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="{{resetUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy this link: {{resetUrl}}</p>
        <p>This link will expire in {{expiryMinutes}} minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `,
      'otp': `
        <h2>Your Verification Code</h2>
        <p>Hi {{name}},</p>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff;">{{otp}}</h1>
        <p>This code will expire in {{expiryMinutes}} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `,
      'welcome': `
        <h2>Welcome to {{appName}}!</h2>
        <p>Hi {{name}},</p>
        <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
        <p>To get started, please log in to your account:</p>
        <a href="{{loginUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Log In</a>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `,
      'account-locked': `
        <h2>Account Locked</h2>
        <p>Hi {{name}},</p>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>Your account will be automatically unlocked at: <strong>{{unlockTime}}</strong></p>
        <p>If you didn't attempt to log in, please contact our support team immediately at {{supportEmail}}.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `,
      'password-changed': `
        <h2>Password Changed</h2>
        <p>Hi {{name}},</p>
        <p>Your password was successfully changed.</p>
        <p>If you didn't make this change, please contact our support team immediately at {{supportEmail}}.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `,
      'new-device-login': `
        <h2>New Device Login Detected</h2>
        <p>Hi {{name}},</p>
        <p>We detected a login to your account from a new device:</p>
        <ul>
          <li><strong>Device:</strong> {{device}}</li>
          <li><strong>Location:</strong> {{location}}</li>
          <li><strong>Time:</strong> {{time}}</li>
        </ul>
        <p>If this was you, you can safely ignore this email.</p>
        <p>If you don't recognize this activity, please secure your account immediately and contact support at {{supportEmail}}.</p>
        <p>Thanks,<br>The {{appName}} Team</p>
      `
    };

    const compiled = Handlebars.compile(defaultTemplates[template]);
    this.cache.set(template, compiled);
    return compiled;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
