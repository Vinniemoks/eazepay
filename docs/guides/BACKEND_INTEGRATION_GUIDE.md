# 🔌 Backend Integration Guide

## Step-by-Step API Integration for Eazepay

---

## 📋 Overview

This guide walks you through connecting all 21 screens to the backend APIs. Each section includes the API endpoint, request/response format, and integration code.

---

## 🔧 Setup

### 1. Configure API Base URL

**File**: `mobile-app/src/config/api.ts`

```typescript
// Update with your backend URL
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

### 2. Update Environment Variables

**File**: `mobile-app/.env`

```bash
API_BASE_URL=https://api.eazepay.com
SENTRY_DSN=your_sentry_dsn
FIREBASE_API_KEY=your_firebase_key
```

---

## 🎯 Phase 1: Authentication APIs

### 1.1 Customer Registration

**Screen**: `RegisterScreen.tsx`  
**Endpoint**: `POST /api/auth/register`

**Request**:
```typescript
{
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  userId: string;
  message: string;
}
```

**Integration**:
```typescript
// In RegisterScreen.tsx, replace:
await new Promise(resolve => setTimeout(resolve, 1500));

// With:
import { authApi } from '../api/auth';

const response = await authApi.register({
  fullName: formData.fullName,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
});

if (response.success) {
  navigation.navigate('Verification', { 
    phone: formData.phone,
    userId: response.userId 
  });
}
```

### 1.2 OTP Verification

**Screen**: `VerificationScreen.tsx`  
**Endpoint**: `POST /api/auth/verify-otp`

**Request**:
```typescript
{
  userId: string;
  phone: string;
  otp: string;
}
```

**Integration**:
```typescript
// Replace in VerificationScreen.tsx:
const response = await authApi.verifyOTP({
  userId: route.params.userId,
  phone: route.params.phone,
  otp: otpCode,
});
```

### 1.3 Login

**Screen**: `LoginScreen.tsx`  
**Endpoint**: `POST /api/auth/login`

**Request**:
```typescript
{
  email: string;
  password: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
```

---

## 💰 Phase 2: Transaction APIs

### 2.1 Send Money

**Screen**: `SendMoneyScreen.tsx`  
**Endpoint**: `POST /api/transactions/send`

**Request**:
```typescript
{
  recipientPhone: string;
  amount: number;
  description?: string;
  pin?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  transactionId: string;
  reference: string;
  fee: number;
  total: number;
}
```

**Integration**:
```typescript
// In SendMoneyScreen.tsx:
import { transactionApi } from '../api/transactions';

const response = await transactionApi.sendMoney({
  recipientPhone: recipient.phone,
  amount: parseFloat(amount),
  description: description,
});

if (response.success) {
  setStep('success');
  setTransactionRef(response.reference);
}
```

### 2.2 Get Transaction History

**Screen**: `WalletScreen.tsx`  
**Endpoint**: `GET /api/transactions/history`

**Query Params**:
```typescript
{
  page?: number;
  limit?: number;
  type?: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL';
  status?: 'COMPLETED' | 'PENDING' | 'FAILED';
  startDate?: string;
  endDate?: string;
}
```

**Integration**:
```typescript
const transactions = await transactionApi.getHistory({
  page: 1,
  limit: 20,
  type: selectedFilter,
});

setTransactions(transactions.data);
```

---

## 🏪 Phase 3: Agent APIs

### 3.1 Agent Registration

**Screen**: `AgentRegisterScreen.tsx`  
**Endpoint**: `POST /api/agents/register`

**Request**:
```typescript
{
  businessName: string;
  registrationNumber: string;
  businessType: string;
  location: string;
  ownerName: string;
  ownerIdNumber: string;
  ownerPhone: string;
  ownerEmail: string;
}
```

### 3.2 Customer Lookup

**Screen**: `CustomerLookupScreen.tsx`  
**Endpoint**: `GET /api/agents/customers/:phoneOrId`

**Response**:
```typescript
{
  id: string;
  name: string;
  phone: string;
  balance: number;
  status: 'active' | 'suspended';
}
```

### 3.3 Deposit Cash

**Screen**: `DepositCashScreen.tsx`  
**Endpoint**: `POST /api/agents/deposit`

**Request**:
```typescript
{
  customerId: string;
  amount: number;
  customerPin: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  transactionId: string;
  commission: number;
  newBalance: number;
}
```

---

## 👨‍💼 Phase 4: Admin APIs

### 4.1 Get Users List

**Screen**: `UserManagementScreen.tsx`  
**Endpoint**: `GET /api/admin/users`

**Query Params**:
```typescript
{
  search?: string;
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  page?: number;
  limit?: number;
}
```

### 4.2 Approve KYC

**Screen**: `UserDetailScreen.tsx`  
**Endpoint**: `POST /api/admin/users/:userId/kyc/approve`

**Request**:
```typescript
{
  notes?: string;
}
```

### 4.3 Get Transactions

**Screen**: `TransactionMonitoringScreen.tsx`  
**Endpoint**: `GET /api/admin/transactions`

**Query Params**:
```typescript
{
  flagged?: boolean;
  status?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}
```

---

## 🔐 Phase 5: Superuser APIs

### 5.1 System Health

**Screen**: `SuperuserDashboardScreen.tsx`  
**Endpoint**: `GET /api/superuser/system/health`

**Response**:
```typescript
{
  overall: number;
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'down';
    uptime: number;
  }>;
  apiResponseTime: number;
  errorRate: number;
  activeUsers: number;
}
```

### 5.2 Get Analytics

**Screen**: `AnalyticsScreen.tsx`  
**Endpoint**: `GET /api/superuser/analytics`

**Query Params**:
```typescript
{
  period: '7d' | '30d' | '90d' | '1y';
}
```

### 5.3 Update Configuration

**Screen**: `SystemConfigurationScreen.tsx`  
**Endpoint**: `PUT /api/superuser/config`

**Request**:
```typescript
{
  platformName?: string;
  supportEmail?: string;
  supportPhone?: string;
  maintenanceMode?: boolean;
  fees?: {
    send: number;
    withdrawal: number;
    deposit: number;
  };
  limits?: {
    daily: number;
    monthly: number;
    min: number;
    max: number;
  };
}
```

---

## 🔄 API Client Implementation

### Create Base API Client

**File**: `mobile-app/src/api/client.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';
import { authStore } from '../store/authStore';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = authStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try refresh
          await this.refreshToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    const refreshToken = authStore.getState().refreshToken;
    const response = await this.client.post('/auth/refresh', { refreshToken });
    authStore.getState().setToken(response.token);
  }

  get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data);
  }

  put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data);
  }

  delete<T>(url: string): Promise<T> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
```

---

## 📝 Integration Checklist

### Authentication (Priority 1):
- [ ] Register API
- [ ] Verify OTP API
- [ ] Login API
- [ ] Refresh token API
- [ ] Logout API

### Customer Features (Priority 2):
- [ ] Get wallet balance
- [ ] Send money
- [ ] Transaction history
- [ ] Generate QR code
- [ ] Request money

### Agent Features (Priority 3):
- [ ] Agent registration
- [ ] Customer lookup
- [ ] Deposit cash
- [ ] Withdraw cash
- [ ] Float management
- [ ] Transaction history

### Admin Features (Priority 4):
- [ ] Get users list
- [ ] User details
- [ ] Approve/reject KYC
- [ ] Suspend account
- [ ] Get transactions
- [ ] Get agents list
- [ ] Approve/reject agent

### Superuser Features (Priority 5):
- [ ] System health
- [ ] Get analytics
- [ ] Admin management
- [ ] System configuration
- [ ] Audit logs

---

## 🧪 Testing Integration

### 1. Test Authentication Flow
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"+254712345678","password":"Test1234"}'
```

### 2. Test with Postman
- Import API collection
- Test each endpoint
- Verify responses
- Check error handling

### 3. Test in App
- Run app in development
- Test each screen
- Verify data flow
- Check error states

---

## 🐛 Common Issues & Solutions

### Issue: CORS errors
**Solution**: Configure backend CORS to allow mobile app origin

### Issue: Token not persisting
**Solution**: Check AsyncStorage implementation in authStore

### Issue: Network timeout
**Solution**: Increase timeout in API_CONFIG or check backend performance

### Issue: 401 Unauthorized
**Solution**: Verify token refresh logic and token expiry

---

## 📊 Progress Tracking

Create a file `INTEGRATION_PROGRESS.md` to track:

```markdown
## API Integration Progress

### Authentication: 0/5
- [ ] Register
- [ ] Verify OTP
- [ ] Login
- [ ] Refresh token
- [ ] Logout

### Customer: 0/10
- [ ] Get balance
- [ ] Send money
- [ ] Transaction history
...

### Agent: 0/8
...

### Admin: 0/12
...

### Superuser: 0/10
...
```

---

## 🚀 Next Steps

1. **Set up backend** - Ensure all endpoints are ready
2. **Configure environment** - Update .env files
3. **Implement API client** - Create base client
4. **Start with auth** - Integrate authentication first
5. **Test thoroughly** - Test each integration
6. **Handle errors** - Implement error handling
7. **Add loading states** - Show progress to users
8. **Monitor performance** - Track API response times

---

**Ready to integrate! Let's connect the frontend to the backend! 🔌**
