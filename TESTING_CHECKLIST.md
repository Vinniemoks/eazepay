# ✅ Testing Checklist

## Complete Testing Guide for Integrated Features

---

## 🎯 Test Environment Setup

### Prerequisites:
- [ ] Backend running on http://localhost:3000
- [ ] Database migrations completed
- [ ] Mobile app installed on device/simulator
- [ ] Network connectivity working
- [ ] Test user credentials ready

---

## 🔐 Authentication Tests

### Registration Flow:
- [ ] **Valid Registration**
  - Enter valid name, email, phone, password
  - Submit form
  - Verify API call to POST /auth/register
  - Receive userId in response
  - Navigate to Verification screen

- [ ] **Invalid Email**
  - Enter invalid email format
  - See validation error
  - Form not submitted

- [ ] **Invalid Phone**
  - Enter invalid phone number
  - See validation error
  - Form not submitted

- [ ] **Weak Password**
  - Enter password < 8 characters
  - See password strength indicator
  - See validation error

- [ ] **Existing User**
  - Register with existing email
  - See error message from backend
  - Stay on registration screen

### OTP Verification:
- [ ] **Valid OTP**
  - Enter correct 6-digit OTP
  - Verify API call to POST /auth/verify-otp
  - Navigate to KYC screen

- [ ] **Invalid OTP**
  - Enter wrong OTP
  - See error message
  - OTP inputs cleared
  - Can retry

- [ ] **Resend OTP**
  - Wait for timer to expire
  - Tap "Resend Code"
  - Verify API call to POST /auth/resend-otp
  - Timer resets to 60 seconds
  - Can enter new OTP

- [ ] **Expired OTP**
  - Wait for OTP to expire
  - Try to verify
  - See error message
  - Can resend

### KYC Upload:
- [ ] **Document Type Selection**
  - Select National ID
  - Select Passport
  - Select Huduma
  - UI updates accordingly

- [ ] **Document Upload**
  - Upload front image
  - Upload back image (for ID)
  - Upload selfie
  - See image previews

- [ ] **Validation**
  - Try submit without document number
  - Try submit without images
  - See validation errors

- [ ] **Successful Upload**
  - Fill all fields
  - Upload all images
  - Submit
  - Verify API call to POST /auth/kyc/upload
  - Navigate to Pending Verification

### Login:
- [ ] **Valid Login**
  - Enter correct email & password
  - Submit
  - Verify API call to POST /auth/login
  - Receive token
  - Navigate to Dashboard

- [ ] **Invalid Credentials**
  - Enter wrong password
  - See error message
  - Stay on login screen

- [ ] **Empty Fields**
  - Try submit with empty fields
  - See validation errors

- [ ] **Biometric Login** (if available)
  - Tap biometric button
  - Authenticate with fingerprint/face
  - Login successful

---

## 💰 Wallet Tests

### Balance Display:
- [ ] **Load Balance**
  - Navigate to Wallet screen
  - Verify API call to GET /wallet/balance
  - See real balance displayed
  - Balance formatted correctly (KES X,XXX.XX)

- [ ] **Pull to Refresh**
  - Pull down on wallet screen
  - See loading indicator
  - Balance refreshes
  - Transaction list refreshes

- [ ] **Loading State**
  - Navigate to wallet
  - See loading indicator
  - Data loads
  - Loading indicator disappears

### Send Money:
- [ ] **Valid Transaction**
  - Enter recipient phone
  - Enter amount
  - Add description (optional)
  - Enter PIN or use biometric
  - Submit
  - Verify API call to POST /wallet/send
  - See success message
  - See transaction reference
  - Balance updates

- [ ] **Insufficient Balance**
  - Enter amount > balance
  - Try to send
  - See error message
  - Transaction not processed

- [ ] **Invalid Amount**
  - Enter 0 or negative amount
  - See validation error
  - Enter non-numeric value
  - See validation error

- [ ] **Invalid Phone**
  - Enter invalid phone format
  - Try to send
  - See error message

- [ ] **Empty Fields**
  - Try submit with empty fields
  - See validation errors

- [ ] **Biometric Authentication**
  - Select biometric option
  - Authenticate
  - Transaction processes

- [ ] **PIN Authentication**
  - Enter PIN
  - Transaction processes

- [ ] **Failed Authentication**
  - Enter wrong PIN
  - See error message
  - Transaction not processed

### Transaction History:
- [ ] **Load History**
  - Navigate to Wallet
  - Verify API call to GET /wallet/transactions
  - See list of transactions
  - Transactions formatted correctly

- [ ] **Transaction Display**
  - See transaction type (Send/Receive)
  - See amount with +/- sign
  - See date formatted
  - See status badge
  - See description

- [ ] **Empty State**
  - New account with no transactions
  - See empty state message

- [ ] **Pull to Refresh**
  - Pull down on transaction list
  - List refreshes
  - New transactions appear

- [ ] **Transaction Details**
  - Tap on a transaction
  - Navigate to detail screen
  - See full transaction info

---

## 🔄 Error Handling Tests

### Network Errors:
- [ ] **No Internet**
  - Disable network
  - Try any API call
  - See "No connection" error
  - Enable network
  - Retry works

- [ ] **Timeout**
  - Slow network
  - API call times out
  - See timeout error
  - Can retry

- [ ] **Server Down**
  - Stop backend
  - Try API call
  - See server error
  - Start backend
  - Retry works

### API Errors:
- [ ] **400 Bad Request**
  - Send invalid data
  - See validation error from backend
  - Error message displayed

- [ ] **401 Unauthorized**
  - Token expires
  - API call fails
  - Token refresh attempted
  - If refresh fails, redirect to login

- [ ] **500 Server Error**
  - Backend error occurs
  - See generic error message
  - Can retry

---

## 🎨 UI/UX Tests

### Loading States:
- [ ] All API calls show loading indicator
- [ ] Loading indicator disappears after response
- [ ] User cannot submit while loading
- [ ] Loading indicator is visible and clear

### Error Messages:
- [ ] Error messages are user-friendly
- [ ] Error messages are specific
- [ ] Error messages suggest solutions
- [ ] Errors are dismissible

### Success Feedback:
- [ ] Success messages shown
- [ ] Success animations work
- [ ] Navigation happens after success
- [ ] Data updates after success

### Form Validation:
- [ ] Real-time validation works
- [ ] Error messages appear below fields
- [ ] Error messages clear when fixed
- [ ] Submit disabled until valid

---

## 📱 Platform-Specific Tests

### iOS:
- [ ] Face ID authentication works
- [ ] Touch ID authentication works
- [ ] Keyboard behavior correct
- [ ] Navigation animations smooth
- [ ] Status bar styling correct

### Android:
- [ ] Fingerprint authentication works
- [ ] Back button behavior correct
- [ ] Keyboard behavior correct
- [ ] Navigation animations smooth
- [ ] Status bar styling correct

---

## 🔒 Security Tests

### Authentication:
- [ ] Token stored securely
- [ ] Token sent in headers
- [ ] Token refreshes automatically
- [ ] Logout clears token
- [ ] Session timeout works

### Sensitive Data:
- [ ] Password not visible by default
- [ ] PIN not visible
- [ ] Balance can be hidden
- [ ] No sensitive data in logs

---

## ⚡ Performance Tests

### Load Times:
- [ ] App launches < 3 seconds
- [ ] API calls complete < 2 seconds
- [ ] Screen transitions smooth
- [ ] No lag in UI interactions

### Memory:
- [ ] No memory leaks
- [ ] App doesn't crash
- [ ] Handles large transaction lists
- [ ] Images load efficiently

---

## 📊 Test Results Template

```markdown
## Test Session: [Date]
**Tester**: [Name]
**Device**: [Device/Simulator]
**OS**: [iOS/Android Version]
**Backend**: [URL]

### Results:
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Failed Tests:
1. [Test Name] - [Issue Description]
2. [Test Name] - [Issue Description]

### Bugs Found:
1. [Bug Description] - [Severity: High/Medium/Low]
2. [Bug Description] - [Severity: High/Medium/Low]

### Notes:
[Any additional observations]
```

---

## 🎯 Priority Testing Order

### Phase 1 (Critical):
1. Registration flow
2. Login flow
3. Balance display
4. Send money

### Phase 2 (Important):
5. OTP verification
6. KYC upload
7. Transaction history
8. Error handling

### Phase 3 (Nice to Have):
9. Pull to refresh
10. Biometric auth
11. Loading states
12. UI polish

---

## ✅ Sign-Off Checklist

Before marking integration complete:
- [ ] All critical tests passed
- [ ] No blocking bugs
- [ ] Error handling works
- [ ] Loading states present
- [ ] Success feedback clear
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Performance acceptable

---

**Testing Status**: Ready to Begin  
**Last Updated**: [Date]  
**Next Review**: After bug fixes
