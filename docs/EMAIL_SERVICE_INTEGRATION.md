# Email Service Integration

## Overview

The email service has been fully integrated into the identity service, providing automated email notifications for authentication events.

## Features Implemented

### ✅ Email Notifications
1. **Password Reset** - Secure reset link with 1-hour expiry
2. **OTP Delivery** - 2FA codes via email (backup to SMS)
3. **Welcome Email** - Sent on successful registration
4. **Account Locked** - Notification when account is locked
5. **Password Changed** - Confirmation after password change
6. **New Device Login** - Alert for logins from new devices

### ✅ Email Providers Supported
- **SMTP** - Generic SMTP (Gmail, Outlook, etc.)
- **SendGrid** - Cloud email service
- **Mailgun** - Transactional email API
- **Development** - Console logging for testing

### ✅ Template Engine
- Handlebars-based templates
- Template caching for performance
- Default templates included
- Custom template support

## Setup

### 1. Install Dependencies

```bash
cd services/shared/email-service
npm install
npm run build

cd ../../identity-service
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
# Email Provider
EMAIL_PROVIDER=development  # or smtp, sendgrid, mailgun

# Email Settings
EMAIL_FROM=noreply@afripay.com
APP_NAME=AfriPay
APP_URL=http://localhost:3000
SUPPORT_EMAIL=support@afripay.com
```

### 3. Provider-Specific Configuration

#### Option A: Development Mode (Testing)

```env
EMAIL_PROVIDER=development
```

Emails will be logged to console instead of sent.

#### Option B: Gmail SMTP

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASSWORD`

#### Option C: SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

**SendGrid Setup:**
1. Sign up at https://sendgrid.com
2. Create API key with "Mail Send" permission
3. Verify sender email address

#### Option D: Mailgun

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_USERNAME=postmaster@your-domain.com
MAILGUN_DOMAIN=your-domain.com
```

**Mailgun Setup:**
1. Sign up at https://mailgun.com
2. Add and verify your domain
3. Get API key from dashboard

## Usage

### Password Reset Email

Automatically sent when user requests password reset:

```typescript
// In AuthEnhancedController.forgotPassword()
await emailService.sendPasswordResetEmail(
  user.email,
  resetToken,
  user.fullName
);
```

**Email includes:**
- Personalized greeting
- Reset link (expires in 1 hour)
- Security notice
- Support contact

### OTP Email

Sent as backup when SMS fails or for 2FA:

```typescript
// In AuthEnhancedController.resendOTP()
await emailService.sendOTPEmail(
  user.email,
  otp,
  user.fullName
);
```

**Email includes:**
- 6-digit OTP code
- Expiry time (10 minutes)
- Security warning

### Welcome Email

Sent after successful registration:

```typescript
// In AuthController.register()
await emailService.sendWelcomeEmail(
  user.email,
  user.fullName
);
```

**Email includes:**
- Welcome message
- Login link
- Getting started tips

## Email Templates

### Default Templates

Located in `services/shared/email-service/src/TemplateEngine.ts`:

1. `email-verification` - Email verification link
2. `password-reset` - Password reset link
3. `otp` - One-time password code
4. `welcome` - Welcome new users
5. `account-locked` - Account locked notification
6. `password-changed` - Password changed confirmation
7. `new-device-login` - New device login alert

### Custom Templates

Create `.hbs` files in `services/identity-service/src/templates/emails/`:

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

### Template Variables

Available in all templates:
- `{{name}}` - User's full name
- `{{appName}}` - Application name
- `{{year}}` - Current year
- `{{supportEmail}}` - Support email address

Template-specific variables:
- Password Reset: `{{resetUrl}}`, `{{expiryMinutes}}`
- OTP: `{{otp}}`, `{{expiryMinutes}}`
- Welcome: `{{loginUrl}}`
- Account Locked: `{{unlockTime}}`
- New Device: `{{device}}`, `{{location}}`, `{{time}}`

## Testing

### Development Mode

```bash
# Set in .env
EMAIL_PROVIDER=development

# Start service
npm run dev

# Trigger password reset
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Check console for email output
```

### SMTP Testing

```bash
# Configure SMTP in .env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Start service
npm run dev

# Trigger email
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Check inbox
```

### Verify Configuration

```bash
# Check logs on startup
npm run dev

# Should see:
# ✅ Email service configured successfully
```

## Error Handling

### Email Sending Failures

Emails are sent with try-catch blocks to prevent authentication failures:

```typescript
try {
  await emailService.sendPasswordResetEmail(...);
  logger.info('Email sent successfully');
} catch (error) {
  logger.error('Email sending failed', { error });
  // Continue anyway - don't fail the request
}
```

### Common Issues

#### 1. Gmail "Less secure app" Error

**Solution:** Use App Passwords instead of account password

#### 2. SendGrid "Sender not verified"

**Solution:** Verify sender email in SendGrid dashboard

#### 3. Mailgun "Domain not verified"

**Solution:** Add DNS records and verify domain

#### 4. Connection Timeout

**Solution:** Check firewall, network connectivity, and SMTP port

## Monitoring

### Email Delivery Logs

Check application logs for email events:

```bash
# Success
✅ Email service configured successfully
📧 Password reset email sent: user@example.com

# Failure
❌ Failed to send email: Connection timeout
⚠️ SMS sending failed, trying email
```

### Metrics to Monitor

1. **Email Send Rate** - Emails sent per minute
2. **Delivery Rate** - Successful deliveries vs attempts
3. **Bounce Rate** - Emails that bounced
4. **Open Rate** - Emails opened (if tracking enabled)
5. **Click Rate** - Links clicked (if tracking enabled)

### Provider Dashboards

- **SendGrid:** https://app.sendgrid.com/statistics
- **Mailgun:** https://app.mailgun.com/app/dashboard
- **Gmail:** Check sent folder

## Security Best Practices

### 1. Protect Credentials

```bash
# Never commit credentials
echo ".env" >> .gitignore

# Use environment variables
export SMTP_PASSWORD="your-password"
```

### 2. Use TLS/SSL

```env
SMTP_SECURE=true  # For port 465
SMTP_SECURE=false # For port 587 with STARTTLS
```

### 3. Rate Limiting

Email sending is automatically rate-limited by authentication rate limits.

### 4. Validate Email Addresses

```typescript
// Email validation in Joi schema
email: Joi.string().email().required()
```

### 5. Prevent Email Enumeration

```typescript
// Always return success, even if email doesn't exist
return res.json({
  success: true,
  message: 'If email exists, reset link has been sent'
});
```

## Performance Optimization

### 1. Template Caching

Templates are cached after first use:

```typescript
// Automatic caching in TemplateEngine
private cache: Map<string, HandlebarsTemplateDelegate>
```

### 2. Async Sending

Emails are sent asynchronously:

```typescript
// Non-blocking email sending
await emailService.sendPasswordResetEmail(...);
```

### 3. Connection Pooling

Nodemailer automatically pools SMTP connections.

### 4. Batch Sending

For bulk emails, use batch sending:

```typescript
const recipients = ['user1@example.com', 'user2@example.com'];
await emailService.send({
  to: recipients,
  subject: 'Announcement',
  html: '<h1>Hello</h1>'
});
```

## Production Checklist

### Before Launch

- [ ] Choose email provider (SendGrid/Mailgun recommended)
- [ ] Configure production credentials
- [ ] Verify sender domain/email
- [ ] Test all email templates
- [ ] Set up monitoring/alerts
- [ ] Configure SPF/DKIM/DMARC records
- [ ] Test email deliverability
- [ ] Set up bounce handling
- [ ] Configure unsubscribe links (if needed)
- [ ] Review email content for compliance

### Email Deliverability

1. **SPF Record:** Authorize sending servers
2. **DKIM:** Sign emails cryptographically
3. **DMARC:** Set email authentication policy
4. **Reverse DNS:** Configure PTR records
5. **Warm Up:** Gradually increase sending volume

### Compliance

- **CAN-SPAM Act:** Include unsubscribe link
- **GDPR:** Get consent for marketing emails
- **CASL:** Canadian anti-spam law
- **Privacy Policy:** Link in footer

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. Check application logs for errors
4. Verify email provider credentials
5. Check email provider dashboard
6. Test with different email address

### Email Delayed

1. Check email provider status
2. Review rate limits
3. Check queue size
4. Monitor server resources

### Template Not Rendering

1. Check template file exists
2. Verify template syntax
3. Check template variables
4. Review error logs
5. Clear template cache

## Future Enhancements

### Planned Features

- [ ] Email verification on registration
- [ ] Email templates in database
- [ ] A/B testing for email content
- [ ] Email analytics dashboard
- [ ] Bounce/complaint handling
- [ ] Unsubscribe management
- [ ] Email scheduling
- [ ] Multi-language support
- [ ] Rich text editor for templates
- [ ] Email preview before sending

## Support

### Documentation

- [Email Service README](../services/shared/email-service/README.md)
- [Quick Start Guide](./QUICK_START_ENHANCED_AUTH.md)
- [Authentication Guide](./ENHANCED_AUTHENTICATION.md)

### Provider Documentation

- **SendGrid:** https://docs.sendgrid.com
- **Mailgun:** https://documentation.mailgun.com
- **Nodemailer:** https://nodemailer.com/about/

### Getting Help

1. Check logs for error messages
2. Review provider documentation
3. Test with development mode
4. Verify configuration
5. Contact support if needed

---

**Status:** ✅ FULLY IMPLEMENTED
**Last Updated:** November 6, 2025
**Version:** 1.0.0
