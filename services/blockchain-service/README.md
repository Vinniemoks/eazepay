# Eazepay Blockchain Service

Provides immutable transaction ledger using Hyperledger Fabric blockchain technology.

## Features

- ✅ Immutable transaction recording
- ✅ Audit trail for compliance
- ✅ Transaction verification
- ✅ Smart contract integration
- ✅ Event-driven architecture (RabbitMQ)
- ✅ RESTful API

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Hyperledger Fabric 2.2+
- RabbitMQ

## Quick Start

### 1. Set up Hyperledger Fabric Network

```bash
# Download Fabric samples and binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.4.9

# Navigate to test network
cd fabric-samples/test-network

# Start the network
./network.sh up createChannel -c eazepay-channel -ca

# Deploy chaincode
./network.sh deployCC -ccn transaction-ledger -ccp ../../chaincode/transaction -ccl javascript
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Record Transaction
```http
POST /api/blockchain/transactions
Content-Type: application/json

{
  "id": "txn_123",
  "type": "TRANSFER",
  "amount": 1000,
  "currency": "KES",
  "fromAccount": "acc_001",
  "toAccount": "acc_002",
  "timestamp": "2025-10-22T10:00:00Z",
  "status": "COMPLETED",
  "metadata": {}
}
```

### Get Transaction
```http
GET /api/blockchain/transactions/:id
```

### Verify Transaction
```http
POST /api/blockchain/verify/:id
Content-Type: application/json

{
  "expectedHash": "abc123..."
}
```

### Get Transaction History
```http
GET /api/blockchain/accounts/:accountId/history?limit=100
```

## Integration with Other Services

The blockchain service automatically listens to RabbitMQ for new transactions:

```typescript
// In transaction-service, publish to RabbitMQ after saving
await channel.publish(
  'eazepay.transactions',
  'transaction.created',
  Buffer.from(JSON.stringify(transaction))
);
```

## Architecture

```
Transaction Service → RabbitMQ → Blockchain Service → Hyperledger Fabric
                                        ↓
                                  PostgreSQL (metadata)
```

## Security

- All transactions are cryptographically signed
- Private channels for sensitive data
- Role-based access control
- TLS encryption for all communication

## Monitoring

- Prometheus metrics at `/metrics`
- Health check at `/health`
- Transaction throughput and latency metrics

## License

Proprietary - Eazepay
