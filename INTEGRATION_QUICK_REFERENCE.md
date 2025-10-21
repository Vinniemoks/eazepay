# 🚀 Backend Integration - Quick Reference

## What's Done & What's Next

---

## ✅ COMPLETED (5/60 APIs)

### Authentication Flow - 100% Complete
```
✅ POST /auth/register          → RegisterScreen
✅ POST /auth/verify-otp        → VerificationScreen  
✅ POST /auth/resend-otp        → VerificationScreen
✅ POST /auth/kyc/upload        → KYCUploadScreen
✅ POST /auth/login             → LoginScreen
```

---

## 🎯 NEXT PRIORITY (5 APIs)

### Wallet & Transactions - 0% Complete
```
⏳ GET  /wallet/balance         → WalletScreen
⏳ POST /transactions/send      → SendMoneyScreen
⏳ GET  /transactions/history   → WalletScreen
⏳ GET  /transactions/:id       → TransactionDetailScreen
⏳ POST /auth/refresh           → API Client
```

---

## 📁 Key Files

### API Clients (Ready to Use):
- `mobile-app/src/api/client.ts` ✅
- `mobile-app/src/api/auth.ts` ✅
- `mobile-app/src/api/transactions.ts` ✅
- `mobile-app/src/api/agent.ts` ✅
- `mobile-app/src/api/admin.ts` ✅
- `mobile-app/src/api/superuser.ts` ✅

### Integrated Screens:
- `RegisterScreen.tsx` ✅
- `VerificationScreen.tsx` ✅
- `KYCUploadScreen.tsx` ✅
- `LoginScreen.tsx` ✅

### Next to Integrate:
- `WalletScreen.tsx` ⏳
- `SendMoneyScreen.tsx` ⏳

---

## 🧪 Testing Commands

### Start Backend:
```bash
cd services/identity-service
npm run dev
```

### Start Mobile App:
```bash
cd mobile-app
npm start
# Then press 'i' for iOS or 'a' for Android
```

### Test Registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+254712345678",
    "password": "Test1234"
  }'
```

---

## 📊 Progress Overview

```
Authentication:  ████████████████████ 100% (5/5)
Customer:        ░░░░░░░░░░░░░░░░░░░░   0% (0/10)
Agent:           ░░░░░░░░░░░░░░░░░░░░   0% (0/10)
Admin:           ░░░░░░░░░░░░░░░░░░░░   0% (0/20)
Superuser:       ░░░░░░░░░░░░░░░░░░░░   0% (0/15)
─────────────────────────────────────────────
Total:           ████░░░░░░░░░░░░░░░░   8% (5/60)
```

---

## 🔧 Quick Integration Pattern

### 1. Import API:
```typescript
import { authApi } from '../../api/auth';
```

### 2. Replace Mock:
```typescript
// Before:
await new Promise(resolve => setTimeout(resolve, 1000));

// After:
const response = await authApi.methodName(data);
```

### 3. Handle Response:
```typescript
try {
  const response = await authApi.methodName(data);
  // Success - navigate or update state
} catch (error: any) {
  // Error - show message
  Alert.alert('Error', error.message);
}
```

---

## 📝 Documentation

### Main Guides:
- **BACKEND_INTEGRATION_GUIDE.md** - Complete guide
- **INTEGRATION_COMPLETE_SUMMARY.md** - What's done
- **BACKEND_INTEGRATION_STATUS.md** - Live progress
- **INTEGRATION_QUICK_REFERENCE.md** - This file

### Progress Tracking:
- **INTEGRATION_PROGRESS.md** - Detailed checklist

---

## 🎯 This Week's Goals

### Monday-Tuesday:
- ✅ Auth flow integration
- ⏳ Wallet balance integration
- ⏳ Send money integration

### Wednesday-Thursday:
- ⏳ Transaction history
- ⏳ Agent registration
- ⏳ Agent dashboard

### Friday:
- ⏳ Testing & bug fixes
- ⏳ Documentation updates

---

## 🐛 Common Issues

### Issue: "Network Error"
**Solution**: Check backend is running on correct port

### Issue: "401 Unauthorized"
**Solution**: Check token is being sent in headers

### Issue: "CORS Error"
**Solution**: Configure backend CORS settings

---

## 💡 Pro Tips

1. **Test backend first** - Use curl or Postman
2. **Check network tab** - Use React Native Debugger
3. **Log requests** - Add console.log in API client
4. **Handle errors** - Always use try/catch
5. **Show loading** - Use loading states

---

## 📞 Need Help?

### Check These First:
1. Backend is running
2. API_BASE_URL is correct in .env
3. Network connection works
4. Backend endpoints match
5. Request/response formats match

### Debug Steps:
1. Check console logs
2. Check network requests
3. Check backend logs
4. Test with curl/Postman
5. Verify data formats

---

**Status**: ✅ Auth Complete, Ready for Wallet Integration  
**Next**: Integrate wallet balance and send money  
**Progress**: 8% (5/60 APIs)
