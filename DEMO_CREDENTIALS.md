# AfriPay Demo Credentials

## Admin Portal Login Credentials

### Super Administrator
- **Email**: `superadmin@afripay.com`
- **Password**: `SuperAdmin@2024`
- **Role**: Super Admin
- **Permissions**: Full system access, user management, system configuration

### System Administrator
- **Email**: `admin@afripay.com`
- **Password**: `Admin@2024`
- **Role**: Admin
- **Permissions**: User management, reports, system monitoring

### Operations Manager
- **Email**: `manager@afripay.com`
- **Password**: `Manager@2024`
- **Role**: Manager
- **Permissions**: Operations management, reports viewing

---

## Customer Portal Demo Credentials

### Demo Customer 1
- **Email**: `customer@afripay.com`
- **Password**: `Customer@2024`
- **Account Type**: Personal
- **Wallet Balance**: $1,000.00

### Demo Customer 2
- **Email**: `john.doe@example.com`
- **Password**: `Demo@2024`
- **Account Type**: Personal
- **Wallet Balance**: $500.00

---

## Agent Portal Demo Credentials

### Demo Agent 1
- **Agent ID**: `AG001`
- **Password**: `Agent@2024`
- **Location**: Lagos, Nigeria
- **Commission Rate**: 2.5%

### Demo Agent 2
- **Agent ID**: `AG002`
- **Password**: `Agent@2024`
- **Location**: Nairobi, Kenya
- **Commission Rate**: 2.0%

---

## Quick Access

### Web Portal
- URL: http://localhost:8080 (or port where served)
- No login required - public website

### Customer Portal
- URL: http://localhost:3001
- Login with customer credentials above

### Agent Portal
- URL: http://localhost:3002
- Login with agent credentials above

### Admin Portal
- URL: http://localhost:8080 (Docker) or http://localhost:3001 (Dev)
- Login with admin credentials above
- **Click on demo credential buttons** to auto-fill login form

---

## Features by Role

### Super Admin Can:
- ✅ Manage all users and roles
- ✅ Configure system settings
- ✅ View all transactions
- ✅ Access audit logs
- ✅ Manage permissions
- ✅ System backup and restore

### Admin Can:
- ✅ Manage users (limited)
- ✅ View reports
- ✅ Monitor system health
- ✅ Handle support tickets
- ✅ View transactions
- ❌ Cannot change system configuration

### Manager Can:
- ✅ View operations dashboard
- ✅ Generate reports
- ✅ View transactions
- ✅ Monitor agents
- ❌ Cannot manage users
- ❌ Cannot change settings

---

## Security Notes

⚠️ **These are demo credentials for development/testing only**

- Do not use these credentials in production
- Change all default passwords before deployment
- Enable MFA for all admin accounts in production
- Implement proper password policies
- Use environment variables for sensitive data

---

## Testing Scenarios

### Test Admin Login Flow:
1. Open Admin Portal
2. Click on any demo credential button
3. Credentials will auto-fill
4. Click "Sign In"
5. You'll be logged in with the selected role

### Test Customer Transactions:
1. Login to Customer Portal
2. Navigate to Wallet
3. Try sending money to another user
4. Check transaction history

### Test Agent Operations:
1. Login to Agent Portal
2. View dashboard with commission stats
3. Process a customer transaction
4. Check commission earnings

---

## API Testing

If you want to test the APIs directly:

```bash
# Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afripay.com","password":"Admin@2024"}'

# Use token for authenticated requests
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Can't login?
- Make sure the identity service is running on port 8000
- Check if the database is initialized
- Verify the .env file has correct credentials

### Portal not loading?
- Check if the dev server is running
- Clear browser cache (Ctrl+Shift+R)
- Check console for errors

### Demo credentials not working?
- The admin portal has built-in demo credentials
- They work even if the backend is not running
- For customer/agent portals, backend must be running

---

## Production Deployment

Before deploying to production:

1. **Remove demo credentials** from the code
2. **Set up proper authentication** with your identity provider
3. **Enable MFA** for all admin accounts
4. **Use strong passwords** (minimum 12 characters)
5. **Implement rate limiting** on login endpoints
6. **Enable audit logging** for all admin actions
7. **Use HTTPS** for all connections
8. **Set up proper CORS** policies
9. **Implement session timeout**
10. **Regular security audits**
