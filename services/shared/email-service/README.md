# Email Service

Shared email service for the Eazepay platform with support for multiple email providers and templating.

## Features

- Multiple email providers (SMTP, SendGrid, Mailgun)
- Handlebars template engine
- Template caching
- Development mode (console logging)
- Pre-built templates for common use cases
- Type-safe API

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

```env
# Email Provider (smtp, sendgrid, mailgun, development)
EMAIL_PROVIDER=smtp

# From Address
EMAIL_FROM=noreply@eazepay.com

# App Configuration
APP_NAME=Eazepay
APP_URL=https://app.eazepay.com
SUPPORT_EMAIL=support@eazepay.com

# SMTP Configuration (if using SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SendGrid Configuration (if using SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key

# Mailgun Configuration (if using Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_USERNAME=postmaster@your-domain.com
MAILGUN_DOMAIN=your-domain.com
```

## Usage

### Basic Setup

```typescript
import { EmailService } from '@eazepay/email-service';
import path from 'path';

const emailService = new EmailService({
  provider: 'smtp',
  from: 'noreply@eazepay.com',
  appName: 'Eazepay',
  appUrl: 'https://app.eazepay.com',
  supportEmail: 'support@eazepay.com',
  templatesDir: path.join(__dirname, 'templates'),
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'your-email@gmail.com',
    password: 'your-app-password'
  }
});

// Verify configuration
const isValid = await emailService.verify();
console.log('Email service configured:', isValid);
```

### Send Password Reset Email

```typescript
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'reset-token-here',
  'John Doe'
);
```

### Send OTP Email

```typescript
await emailService.sendOTPEmail(
  'user@example.com',
  '123456',
  'John Doe'
);
```

### Send Welcome Email

```typescript
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

### Send Custom Email

```typescript
await emailService.send({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Hello World</h1>'
});
```

### Send with Template

```typescript
await emailService.sendTemplate(
  'custom-template',
  'user@example.com',
  {
    name: 'John Doe',
    customData: 'value'
  }
);
```

## Available Templates

1. **email-verification** - Email verification link
2. **password-reset** - Password reset link
3. **otp** - One-time password code
4. **welcome** - Welcome new users
5. **account-locked** - Account locked notification
6. **password-changed** - Password changed confirmation
7. **new-device-login** - New device login alert

## Creating Custom Templates

Create a `.hbs` file in the templates directory:

```handlebars
<!DOCTYPE html>
<html>
<head>
  <title>{{subject}}</title>
</head>
<body>
  <h1>Hello {{name}}</h1>
  <p>{{message}}</p>
  <p>© {{year}} {{appName}}</p>
</body>
</html>
```

## Email Providers

### SMTP (Generic)

Works with any SMTP server (Gmail, Outlook, etc.)

```typescript
{
  provider: 'smtp',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'your-email@gmail.com',
    password: 'your-app-password'
  }
}
```

### SendGrid

```typescript
{
  provider: 'sendgrid',
  sendgrid: {
    apiKey: 'your-sendgrid-api-key'
  }
}
```

### Mailgun

```typescript
{
  provider: 'mailgun',
  mailgun: {
    apiKey: 'your-mailgun-api-key',
    username: 'postmaster@your-domain.com',
    domain: 'your-domain.com'
  }
}
```

### Development Mode

Logs emails to console instead of sending:

```typescript
{
  provider: 'development'
}
```

## Testing

```bash
npm test
```

## Gmail Setup

To use Gmail SMTP:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in SMTP_PASSWORD

## Best Practices

1. **Use environment variables** for sensitive data
2. **Verify configuration** on startup
3. **Handle errors** gracefully
4. **Use templates** for consistent branding
5. **Test in development mode** before production
6. **Monitor email delivery** rates
7. **Implement retry logic** for failed sends

## Error Handling

```typescript
try {
  await emailService.sendPasswordResetEmail(email, token, name);
} catch (error) {
  console.error('Failed to send email:', error);
  // Handle error (retry, log, alert admin, etc.)
}
```

## Performance

- Templates are cached after first use
- Supports bulk sending
- Async/await for non-blocking operations
- Connection pooling (via nodemailer)

## Security

- Never log email content in production
- Use TLS/SSL for SMTP connections
- Rotate API keys regularly
- Validate email addresses before sending
- Rate limit email sending
- Monitor for abuse

## Troubleshooting

### Emails not sending

1. Check email provider credentials
2. Verify network connectivity
3. Check spam folder
4. Review email provider logs
5. Test with development mode

### Gmail "Less secure app" error

Use App Passwords instead of account password.

### SendGrid/Mailgun errors

Verify API key and domain configuration.

## License

MIT
