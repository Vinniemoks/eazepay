# Agent Registration & Biometric Payment Flow

## 🏪 Customer Registration at Agent Location

### Complete Flow

```
Customer walks into Agent → 
Agent scans all 10 fingers + palms → 
System checks for duplicates (fraud detection) → 
Creates user account → 
Enrolls biometrics → 
Creates wallet → 
Customer ready to pay!
```

### Detailed Steps

#### 1. Agent Initiates Registration
```
POST /api/agent/register-customer
Authorization: Bearer <agent_token>

{
  "phoneNumber": "254712345678",
  "fullName": "John Doe",
  "nationalId": "12345678",
  "email": "john@example.com",
  "biometricData": [
    // Left hand
    {"type": "fingerprint", "fingerType": "thumb", "hand": "left", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "index", "hand": "left", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "middle", "hand": "left", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "ring", "hand": "left", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "pinky", "hand": "left", "data": "base64..."},
    
    // Right hand
    {"type": "fingerprint", "fingerType": "thumb", "hand": "right", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "index", "hand": "right", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "middle", "hand": "right", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "ring", "hand": "right", "data": "base64..."},
    {"type": "fingerprint", "fingerType": "pinky", "hand": "right", "data": "base64..."},
    
    // Palms
    {"type": "palm", "hand": "left", "data": "base64..."},
    {"type": "palm", "hand": "right", "data": "base64..."}
  ],
  "primaryFingerIndex": 6  // Right index finger for quick payments
}
```

#### 2. Service Communication Flow

```
Agent Service (8005)
    ↓
    ├─→ Biometric Service (8001)
    │   ├─→ Check for duplicates (fraud detection)
    │   │   └─→ Redis: Check biometric hashes
    │   │
    │   ├─→ Identity Service (8000)
    │   │   └─→ Create user account
    │   │       └─→ PostgreSQL: Store user data
    │   │
    │   └─→ Enroll all biometric templates
    │       ├─→ Encrypt with AES-256-GCM
    │       ├─→ Store in PostgreSQL
    │       └─→ Cache hash in Redis
    │
    └─→ Wallet Service (8003)
        └─→ Create wallet
            └─→ PostgreSQL: Initialize balance
```

#### 3. Response to Agent
```json
{
  "success": true,
  "userId": "usr_abc123",
  "walletId": "wlt_xyz789",
  "templatesEnrolled": 12,
  "message": "Customer registered successfully",
  "nextSteps": [
    "Customer can now use biometric payment",
    "Customer should top up wallet via M-Pesa",
    "Customer can request virtual card for online shopping"
  ]
}
```

---

## 💳 Biometric Payment at POS

### Flow

```
Customer places finger on POS → 
Biometric captured → 
Sent to Biometric Service → 
Matched against all enrolled templates → 
If match > 85% → Payment authorized → 
Wallet debited → Transaction complete
```

### Detailed Steps

#### 1. POS Captures Biometric
```
POST /api/biometric/verify
Authorization: Bearer <merchant_token>

{
  "transactionId": "txn_123",
  "amount": 500,
  "currency": "KES",
  "merchantId": "mch_456",
  "biometricData": "base64_encoded_fingerprint"
}
```

#### 2. Verification Process
```
Biometric Service
    ↓
    ├─→ Extract features from captured biometric
    │
    ├─→ Load all enrolled templates from database
    │   └─→ Decrypt templates
    │
    ├─→ Compare against each template
    │   ├─→ Calculate match score
    │   └─→ Find best match
    │
    └─→ If match score ≥ 85%
        ├─→ Identify user
        ├─→ Log successful verification
        └─→ Return authorization
```

#### 3. Payment Processing
```
Payment Gateway
    ↓
    ├─→ Verify biometric (done above)
    │
    ├─→ Check wallet balance
    │   └─→ Wallet Service
    │
    ├─→ Debit wallet
    │   └─→ PostgreSQL: Update balance
    │
    ├─→ Credit merchant
    │   └─→ Settlement Service
    │
    └─→ Log transaction
        └─→ Audit Logger
```

---

## 🔄 Mobile Sync Flow

### Scenario: User Already Has Biometrics on Phone

```
User downloads app → 
Logs in with phone number → 
App detects biometric capability → 
Syncs fingerprint to server → 
Checks for duplicates → 
If new, adds to enrolled templates → 
If duplicate, verifies ownership
```

### API Call
```
POST /api/biometric/sync
Authorization: Bearer <user_token>

{
  "biometricData": "base64_encoded_fingerprint_from_phone"
}
```

### Duplicate Detection
```
Biometric Service
    ↓
    ├─→ Extract features
    │
    ├─→ Generate hash
    │
    ├─→ Check Redis for existing hash
    │
    ├─→ If found:
    │   ├─→ Compare userId
    │   ├─→ If same user: "Already synced"
    │   └─→ If different user: "Fraud detected!"
    │
    └─→ If not found:
        └─→ Enroll new template
```

---

## 🛡️ Fraud Prevention

### Duplicate Detection System

#### 1. During Registration
```
For each biometric:
    ↓
    Extract features → 
    Generate hash → 
    Check Redis: biometric:hash:{hash} → 
    If exists → REJECT (fraud attempt) → 
    If not exists → ACCEPT → Store hash
```

#### 2. Hash Storage
```
Redis Key: biometric:hash:{sha256_hash}
Value: userId
TTL: 1 year

Example:
biometric:hash:a3f5b2c... → usr_abc123
```

#### 3. Fraud Alert
```
If duplicate detected:
    ↓
    ├─→ Log security event
    │   └─→ Audit Logger (severity: HIGH)
    │
    ├─→ Notify security team
    │   └─→ Webhook alert
    │
    ├─→ Block registration
    │   └─→ Return 409 Conflict
    │
    └─→ Flag agent for review
        └─→ Possible collusion
```

---

## 🔐 Security Measures

### 1. Biometric Data Protection
- **Encryption**: AES-256-GCM for all templates
- **Storage**: Encrypted at rest in PostgreSQL
- **Transmission**: TLS 1.3 for all API calls
- **Access**: Only Biometric Service can decrypt

### 2. Inter-Service Authentication
```
All service-to-service calls require:
    ↓
    ├─→ Internal API Key (X-Internal-API-Key header)
    ├─→ TLS 1.3 connection
    ├─→ Request signing (optional mTLS)
    └─→ Rate limiting
```

### 3. Audit Trail
```
Every action logged:
    ↓
    ├─→ Who: userId, agentId
    ├─→ What: action, resource
    ├─→ When: timestamp
    ├─→ Where: IP address, location
    ├─→ Result: success/failure
    └─→ Metadata: additional context
```

---

## 📊 Service Communication Matrix

| From Service | To Service | Purpose | Auth Method |
|--------------|------------|---------|-------------|
| Agent → Biometric | Register user | Internal API Key |
| Biometric → Identity | Create account | Internal API Key |
| Biometric → Redis | Cache templates | Direct connection |
| Agent → Wallet | Create wallet | Internal API Key |
| POS → Biometric | Verify payment | Merchant token |
| Biometric → Wallet | Check balance | Internal API Key |
| Mobile App → Biometric | Sync fingerprint | User JWT token |
| Any → Audit Logger | Log events | Direct call |

---

## 🎯 Success Criteria

### Registration
- ✅ All 10 fingers + palms enrolled
- ✅ No duplicates detected
- ✅ User account created
- ✅ Wallet initialized
- ✅ Primary finger designated
- ✅ Agent statistics updated

### Payment
- ✅ Biometric verified in < 1 second
- ✅ Match score ≥ 85%
- ✅ Wallet has sufficient balance
- ✅ Transaction logged
- ✅ Receipt generated

### Fraud Prevention
- ✅ Duplicate detection working
- ✅ Security alerts triggered
- ✅ Audit logs complete
- ✅ Agent flagging system active

---

## 🚀 Next Steps

1. **Deploy Services**
   ```bash
   docker-compose -f docker-compose.secure.yml up -d
   ```

2. **Create Agent Account**
   ```bash
   POST /api/users/create-agent
   ```

3. **Register First Customer**
   ```bash
   POST /api/agent/register-customer
   ```

4. **Test Payment**
   ```bash
   POST /api/biometric/verify
   ```

5. **Monitor Logs**
   ```bash
   tail -f logs/audit-*.log
   ```

---

**Your customers can now pay with just one finger at any location globally!** 🖐️💳
