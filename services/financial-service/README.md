# Financial Service

Transaction recording and financial analytics service with millisecond-precision timestamps.

## Features

- **Transaction Recording**: Record financial transactions with idempotency support
- **Transaction Search**: Advanced filtering by date, amount, type, status, and user
- **Financial Analytics**: Real-time financial summaries and detailed analytics
- **Millisecond Precision**: All timestamps stored with millisecond accuracy
- **Timezone Support**: Convert timestamps to any timezone for display

## API Endpoints

### Transactions

#### Record Transaction
```
POST /api/transactions
Headers:
  Authorization: Bearer <token>
  Idempotency-Key: <uuid-v4>
Body:
{
  "type": "TRANSFER",
  "amount": "1000.00",
  "currency": "KES",
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "description": "Payment for services",
  "metadata": {}
}
```

#### Search Transactions
```
GET /api/transactions/search?startDate=2024-01-01&endDate=2024-12-31&type=TRANSFER&status=COMPLETED&page=1&limit=50
Headers:
  Authorization: Bearer <token>
```

#### Get Transaction
```
GET /api/transactions/:id?timezone=Africa/Nairobi
Headers:
  Authorization: Bearer <token>
```

### Analytics

#### Financial Summary
```
GET /api/analytics/summary?period=day
Headers:
  Authorization: Bearer <token>
Permissions: VIEW_ANALYTICS
```

#### Detailed Analytics
```
GET /api/analytics/detailed?startDate=2024-01-01&endDate=2024-12-31&groupBy=day
Headers:
  Authorization: Bearer <token>
Permissions: VIEW_ANALYTICS
```

## Transaction Types

- `DEPOSIT`: Money added to account
- `WITHDRAWAL`: Money removed from account
- `TRANSFER`: Money moved between accounts
- `PAYMENT`: Payment for goods/services
- `REFUND`: Money returned to customer
- `FEE`: Service fee charged
- `COMMISSION`: Commission earned
- `REVERSAL`: Transaction reversed

## Transaction Status

- `PENDING`: Transaction initiated
- `PROCESSING`: Transaction being processed
- `COMPLETED`: Transaction successful
- `FAILED`: Transaction failed
- `REVERSED`: Transaction reversed

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run migrations:
```bash
cd ../../infrastructure/database
./run-migrations.sh
```

4. Start service:
```bash
npm run dev
```

## Docker

Build and run:
```bash
docker build -t financial-service .
docker run -p 3002:3002 --env-file .env financial-service
```

## Error Codes

- `FIN_001`: General financial service error
- `FIN_002`: Invalid idempotency key
- `AUTH_001`: Authentication required
- `AUTH_002`: Invalid or expired token
- `AUTH_003`: Insufficient permissions
- `VAL_001`: Invalid transaction type
- `VAL_002`: Invalid amount
- `VAL_003`: Invalid currency code
- `VAL_004`: Missing required user IDs
- `VAL_005`: Invalid user ID combination
