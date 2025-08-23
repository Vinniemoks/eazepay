# AfriPay Universal API Documentation

## Base URLs
- **Development**: `http://localhost:8000` (Identity Service), `http://localhost:8001` (Biometric Service)
- **Production**: `https://api.afripay.com`

## Authentication
All API requests require authentication using JWT tokens obtained from the authentication endpoints.

```http
Authorization: Bearer <jwt_token>
```

### Getting Authentication Token

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "12345",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

## Common Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-API-Version: v1
```

## Response Format
All API responses follow a consistent structure:

```json
{
  "success": boolean,
  "data": object|array|null,
  "message": "string",
  "errors": array|null,
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "uuid"
}
```

## Error Responses

All endpoints return error responses in the following format:
```json
{
  "success": false,
  "error": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `422`: Validation Error
- `500`: Internal Server Error

## Identity Service API

### Authentication

#### Register User
**POST** `/api/auth/register`

Register a new user in the system.

**Request Body:**
```json
{
  "phoneNumber": "+254700123456",
  "nationalId": "12345678",
  "firstName": "John",
  "lastName": "Doe",
  "biometricData": "base64_encoded_data", // optional
  "biometricType": "FINGERPRINT" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "phoneNumber": "+254700123456",
    "authLevel": 2,
    "kycStatus": "PENDING",
    "biometricEnrolled": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Biometric Authentication
**POST** `/api/auth/biometric-auth`

Authenticate user using biometric data.

**Request Body:**
```json
{
  "phoneNumber": "+254700123456",
  "biometricData": "base64_encoded_fingerprint",
  "biometricType": "FINGERPRINT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "phoneNumber": "+254700123456",
    "authLevel": 2,
    "confidence": 0.95,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Management

#### Get User Profile
**GET** `/api/v1/users/profile`

#### Update User Profile
**PUT** `/api/v1/users/profile`

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+254700000000"
}
```

### Account Management

#### Get Account Balance
**GET** `/api/v1/accounts/balance`

#### Get Transaction History
**GET** `/api/v1/accounts/transactions?page=1&limit=20`

## Payment Endpoints

### Mobile Money

#### M-Pesa STK Push
**POST** `/api/v1/payments/mpesa/stk-push`

```json
{
  "phone_number": "254700000000",
  "amount": 100,
  "account_reference": "AfriPay001",
  "transaction_desc": "Payment for services"
}
```

#### Check Payment Status
**GET** `/api/v1/payments/status/{transaction_id}`

### Bank Transfers

#### Initiate Bank Transfer
**POST** `/api/v1/payments/bank-transfer`

```json
{
  "recipient_account": "1234567890",
  "recipient_bank": "EQUITY",
  "amount": 1000,
  "description": "Payment for services"
}
```

## Biometric Service API

### Fingerprint Management

#### Enroll Fingerprint
**POST** `/enroll/fingerprint`

Enroll a fingerprint template for a user.

**Form Data:**
- `user_id`: UUID of the user
- `file`: Fingerprint image file (PNG, JPG)

**Response:**
```json
{
  "success": true,
  "template_id": "template_123",
  "quality": 0.85,
  "message": "Fingerprint enrolled successfully"
}
```

#### Verify Fingerprint
**POST** `/verify/fingerprint`

Verify a fingerprint against enrolled template.

**Form Data:**
- `user_id`: UUID of the user
- `file`: Fingerprint image file for verification

**Response:**
```json
{
  "verified": true,
  "confidence": 0.92,
  "quality": 0.88
}
```

### Legacy Biometric Endpoints

#### Register Fingerprint (Legacy)
**POST** `/api/v1/biometrics/fingerprint/register`

```json
{
  "user_id": "12345",
  "fingerprint_data": "base64_encoded_fingerprint",
  "finger_position": "right_thumb"
}
```

#### Verify Fingerprint (Legacy)
**POST** `/api/v1/biometrics/fingerprint/verify`

```json
{
  "user_id": "12345",
  "fingerprint_data": "base64_encoded_fingerprint"
}
```

### Face Recognition

#### Register Face
**POST** `/api/v1/biometrics/face/register`

```json
{
  "user_id": "12345",
  "face_image": "base64_encoded_image"
}
```

#### Verify Face
**POST** `/api/v1/biometrics/face/verify`

```json
{
  "user_id": "12345",
  "face_image": "base64_encoded_image"
}
```

## Webhook Endpoints

### Payment Notifications
**POST** `/webhooks/payment-notification`

AfriPay will send POST requests to your configured webhook URL when payment status changes.

```json
{
  "event": "payment.completed",
  "transaction_id": "tx_12345",
  "amount": 100,
  "status": "completed",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **Payment endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### JavaScript/Node.js
```javascript
const AfriPaySDK = require('@afripay/sdk');

const client = new AfriPaySDK({
  apiKey: 'your_api_key',
  environment: 'development' // or 'production'
});

// Initiate M-Pesa payment
const payment = await client.payments.mpesa.stkPush({
  phoneNumber: '254700000000',
  amount: 100,
  accountReference: 'AfriPay001'
});
```

### Python
```python
from afripay_sdk import AfriPayClient

client = AfriPayClient(
    api_key='your_api_key',
    environment='development'
)

# Initiate M-Pesa payment
payment = client.payments.mpesa.stk_push(
    phone_number='254700000000',
    amount=100,
    account_reference='AfriPay001'
)
```

### PHP
```php
<?php
use AfriPay\SDK\AfriPayClient;

$client = new AfriPayClient([
    'api_key' => 'your_api_key',
    'environment' => 'development'
]);

// Initiate M-Pesa payment
$payment = $client->payments->mpesa->stkPush([
    'phone_number' => '254700000000',
    'amount' => 100,
    'account_reference' => 'AfriPay001'
]);
?>
```

## Testing
### Test Credentials
- **Test API Key**: `test_key_12345`
- **Test Phone Number**: `254700000000`
- **Test Amount**: Any amount between 1-1000

### Postman Collection
Download our Postman collection: [AfriPay API Collection](https://api.afripay.com/postman/collection.json)

## Support
- **Email**: developers@afripay.com
- **Documentation**: https://docs.afripay.com
- **Status Page**: https://status.afripay.com

## Changelog
### v1.2.0 (2024-01-15)
- Added biometric authentication endpoints
- Improved error handling
- Added webhook support

### v1.1.0 (2023-12-01)
- Added bank transfer endpoints
- Enhanced security features
- Performance improvements

### v1.0.0 (2023-10-01)
- Initial release
- Basic payment functionality
- User management
