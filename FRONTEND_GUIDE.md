# Eazepay Agent Portal - Frontend Guide

## 🎨 Overview

Complete React-based frontend for agent customer registration with biometric enrollment.

## ✅ Features Implemented

### 1. **Customer Registration Flow**
- Step-by-step wizard interface
- Customer details form
- Biometric capture for all 10 fingers + palms
- Primary finger designation
- Review before submission
- Success confirmation

### 2. **Biometric Capture Component**
- Visual feedback for capture status
- Support for hardware integration
- File upload fallback
- Recapture capability
- Primary finger marking

### 3. **Agent Dashboard**
- Registration statistics
- Cash-in/cash-out metrics
- Total volume tracking
- Real-time updates

### 4. **Customer Verification**
- Single fingerprint verification
- Customer details display
- Match score indication

### 5. **Cash Transactions**
- Cash-in processing
- Cash-out processing
- Biometric verification
- Amount input

## 📁 File Structure

```
portals/agent-portal/
├── src/
│   ├── App.tsx                          # Main app with routing
│   ├── components/
│   │   ├── AgentLayout.tsx              # Layout with sidebar
│   │   └── BiometricCapture.tsx         # Biometric capture component
│   ├── pages/
│   │   ├── Login.tsx                    # Agent login
│   │   ├── Dashboard.tsx                # Statistics dashboard
│   │   ├── RegisterCustomer.tsx         # Customer registration
│   │   ├── VerifyCustomer.tsx           # Customer verification
│   │   └── CashTransactions.tsx         # Cash-in/out
│   └── services/
│       └── api.ts                       # API client
├── package.json
└── README.md
```

## 🚀 Setup & Run

### Install Dependencies
```bash
cd portals/agent-portal
npm install
```

### Configure API
```bash
# Create .env file
echo "REACT_APP_API_URL=https://api.eazepay.com" > .env
```

### Start Development Server
```bash
npm start
# Opens at http://localhost:3000
```

### Build for Production
```bash
npm run build
# Creates optimized build in /build
```

## 🎯 Usage Flow

### 1. Agent Login
```
Agent opens portal → 
Enters phone number & password → 
Authenticates → 
Redirected to dashboard
```

### 2. Register Customer
```
Click "Register Customer" → 
Step 1: Enter customer details
  - Phone number (254XXXXXXXXX)
  - Full name
  - National ID
  - Email (optional)
→ Click "Next"

Step 2: Capture biometrics
  - Left hand: 5 fingers
  - Right hand: 5 fingers
  - Both palms
  - Designate primary finger
→ Click "Next"

Step 3: Review
  - Verify all details
  - Check all biometrics captured
→ Click "Complete Registration"

Success!
  - User ID displayed
  - Wallet ID displayed
  - Next steps shown
```

### 3. Verify Customer
```
Click "Verify Customer" → 
Capture fingerprint → 
Click "Verify" → 
Customer details displayed
```

### 4. Cash Transactions
```
Click "Transactions" → 
Select "Cash In" or "Cash Out" → 
Capture customer fingerprint → 
Enter amount → 
Click "Process"
```

## 🔌 API Integration

### Endpoints Used

```typescript
// Authentication
POST /api/auth/login
{
  phoneNumber: "254712345678",
  password: "password"
}

// Register customer
POST /api/agent/register-customer
{
  phoneNumber: "254712345678",
  fullName: "John Doe",
  nationalId: "12345678",
  biometricData: [...],
  primaryFingerIndex: 6
}

// Verify customer
POST /api/agent/verify-customer
{
  biometricData: "base64..."
}

// Cash-in
POST /api/agent/cash-in
{
  biometricData: "base64...",
  amount: 1000,
  currency: "KES"
}

// Cash-out
POST /api/agent/cash-out
{
  biometricData: "base64...",
  amount: 500,
  currency: "KES"
}

// Statistics
GET /api/agent/stats
```

## 🔧 Biometric Hardware Integration

### Current Implementation
- Mock biometric capture (for development)
- File upload support
- Base64 encoding

### Production Integration

Replace mock capture in `BiometricCapture.tsx`:

```typescript
// Example with hardware SDK
import BiometricSDK from 'biometric-hardware-sdk';

const handleCapture = async () => {
  try {
    const sdk = new BiometricSDK();
    await sdk.initialize();
    
    const biometricData = await sdk.captureFingerprint({
      timeout: 10000,
      quality: 'high'
    });
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...biometricData));
    onCapture(base64);
  } catch (error) {
    console.error('Capture failed:', error);
  }
};
```

### Supported Hardware
- **Fingerprint Scanners**: 
  - Morpho MSO 1300
  - Digital Persona U.are.U 4500
  - Suprema BioMini Plus 2
  
- **Palm Scanners**:
  - Fujitsu PalmSecure
  - Redrock Biometrics

## 🎨 UI Components

### Material-UI Components Used
- `Card`, `CardContent` - Container components
- `Stepper`, `Step`, `StepLabel` - Multi-step wizard
- `TextField` - Form inputs
- `Button`, `IconButton` - Actions
- `Alert` - Notifications
- `Chip` - Status indicators
- `Grid` - Layout
- `Typography` - Text

### Custom Components
- `BiometricCapture` - Reusable biometric capture
- `AgentLayout` - App layout with sidebar

## 📱 Responsive Design

- Desktop: Full sidebar navigation
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation (future)

## 🔒 Security Features

### Authentication
- JWT token storage in localStorage
- Automatic token refresh
- Redirect on 401 errors

### Data Protection
- HTTPS only in production
- Biometric data encrypted in transit
- No biometric data stored in browser

### Input Validation
- Phone number format validation
- Required field validation
- Amount validation

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register customer with all biometrics
- [ ] Register customer with missing biometric
- [ ] Verify existing customer
- [ ] Verify non-existent customer
- [ ] Process cash-in transaction
- [ ] Process cash-out transaction
- [ ] View dashboard statistics
- [ ] Logout

### Automated Testing (Future)
```bash
npm test
```

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy to Nginx
```bash
# Copy build to web server
cp -r build/* /var/www/agent-portal/

# Nginx config
server {
    listen 443 ssl;
    server_name agent.eazepay.com;
    
    root /var/www/agent-portal;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass https://api.eazepay.com;
    }
}
```

### Deploy to AWS S3 + CloudFront
```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://agent-portal-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id XXXXX \
  --paths "/*"
```

## 📊 Performance

### Optimization
- Code splitting with React.lazy
- Image optimization
- Gzip compression
- CDN for static assets

### Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## 🐛 Troubleshooting

### Issue: Biometric capture not working
**Solution**: Check hardware connection and SDK initialization

### Issue: API calls failing
**Solution**: Verify API_URL in .env and check CORS settings

### Issue: Login redirect loop
**Solution**: Clear localStorage and check token expiration

## 📞 Support

For frontend issues:
- Check browser console for errors
- Verify API connectivity
- Review network tab in DevTools

---

**Your agent portal is ready for customer registration!** 🎉
