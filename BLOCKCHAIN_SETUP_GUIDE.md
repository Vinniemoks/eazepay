# Blockchain Integration Setup Guide

## Overview

Your Eazepay system now has blockchain integration for:
- ✅ Immutable transaction recording
- ✅ Tamper-proof audit trails
- ✅ Regulatory compliance
- ✅ Transaction verification

## Architecture

```
Transaction Flow:
1. Transaction → PostgreSQL (ACID, fast queries)
2. Event → RabbitMQ (async messaging)
3. Blockchain Service → Hyperledger Fabric (immutability)
4. Hash → Back to PostgreSQL (quick verification)
```

## What's Been Integrated

### 1. Blockchain Service (`services/blockchain-service/`)
- ✅ Hyperledger Fabric client
- ✅ Transaction recording API
- ✅ Audit log recording API
- ✅ RabbitMQ event consumer
- ✅ Verification endpoints

### 2. Transaction Service Integration
- ✅ BlockchainClient.java - Communicates with blockchain service
- ✅ TransactionBlockchainDTO.java - Data transfer object
- ✅ Updated TransactionService.java - Auto-records on blockchain

### 3. Identity Service Integration
- ✅ BlockchainService.ts - Audit log recording
- ✅ Async blockchain recording (non-blocking)

### 4. Smart Contracts (Chaincode)
- ✅ transaction-ledger.go - Hyperledger Fabric chaincode
- ✅ Transaction CRUD operations
- ✅ Audit log operations
- ✅ Query functions

## Prerequisites

Before starting, ensure you have:
- ✅ Docker & Docker Compose
- ✅ Node.js 18+
- ✅ Go 1.20+ (for chaincode)
- ✅ Java 17+ (for transaction service)

## Setup Instructions

### Step 1: Install Hyperledger Fabric

```bash
# Download Fabric binaries and samples
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5

# This creates a fabric-samples directory
cd fabric-samples
```

### Step 2: Set Up Test Network

```bash
cd test-network

# Start the network with CA
./network.sh up createChannel -c eazepay-channel -ca

# You should see:
# ✅ Channel 'eazepay-channel' created
# ✅ Peer nodes running
# ✅ Orderer running
```

### Step 3: Deploy Chaincode

```bash
# Copy your chaincode to fabric-samples
cp -r ../../services/blockchain-service/chaincode ../chaincode/transaction-ledger

# Deploy the chaincode
./network.sh deployCC \
  -ccn transaction-ledger \
  -ccp ../chaincode/transaction-ledger \
  -ccl go

# You should see:
# ✅ Chaincode installed on peers
# ✅ Chaincode approved
# ✅ Chaincode committed
```

### Step 4: Configure Connection Profile

```bash
# Copy connection profile to blockchain service
cd ../../services/blockchain-service

# Create fabric-network directory
mkdir -p fabric-network

# Copy connection profile from test-network
cp ../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json \
   fabric-network/connection-profile.json
```

### Step 5: Set Up Wallet

```bash
# Create wallet directory
mkdir -p wallet

# Copy admin identity
cp -r ../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp \
      wallet/eazepayUser
```

### Step 6: Start Services

```bash
# Return to project root
cd ../..

# Start all services including blockchain
docker-compose up -d blockchain-service

# Check logs
docker logs afripay-blockchain -f
```

## Testing the Integration

### Test 1: Create a Transaction

```bash
# Create a transaction via transaction-service
curl -X POST http://localhost:8002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "fromAccount": "acc_001",
    "toAccount": "acc_002",
    "type": "TRANSFER",
    "description": "Test transaction"
  }'

# Check blockchain service logs
docker logs afripay-blockchain

# You should see:
# ✅ Transaction recorded on blockchain
```

### Test 2: Verify Transaction

```bash
# Get transaction from blockchain
curl http://localhost:8020/api/blockchain/transactions/1

# Response:
{
  "success": true,
  "transaction": {
    "id": "1",
    "type": "TRANSFER",
    "amount": 1000,
    ...
  }
}
```

### Test 3: Verify Integrity

```bash
# Verify transaction hasn't been tampered with
curl -X POST http://localhost:8020/api/blockchain/verify/1 \
  -H "Content-Type: application/json" \
  -d '{
    "expectedHash": "abc123..."
  }'

# Response:
{
  "success": true,
  "isValid": true
}
```

## How It Works

### Transaction Recording Flow

```
1. User creates transaction
   ↓
2. TransactionService.createTransaction()
   ↓
3. Save to PostgreSQL (ACID)
   ↓
4. Publish to RabbitMQ (async)
   ↓
5. BlockchainService receives event
   ↓
6. Record on Hyperledger Fabric
   ↓
7. Return blockchain hash
   ↓
8. Store hash in PostgreSQL
```

### Audit Log Flow

```
1. User action (login, update, etc.)
   ↓
2. Create audit log in PostgreSQL
   ↓
3. BlockchainService.recordAuditLogAsync()
   ↓
4. Record on blockchain (non-blocking)
   ↓
5. Immutable audit trail created
```

## Configuration

### Environment Variables

**Blockchain Service** (`.env`):
```env
PORT=8020
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672/afripay
FABRIC_CHANNEL_NAME=eazepay-channel
FABRIC_CHAINCODE_NAME=transaction-ledger
```

**Transaction Service** (`application.properties`):
```properties
blockchain.service.url=http://blockchain-service:8020
```

**Identity Service** (`.env`):
```env
BLOCKCHAIN_SERVICE_URL=http://blockchain-service:8020
```

## Monitoring

### Check Blockchain Service Health

```bash
curl http://localhost:8020/health
```

### View Blockchain Logs

```bash
docker logs afripay-blockchain -f
```

### Check Fabric Network

```bash
cd fabric-samples/test-network
docker ps

# You should see:
# - peer0.org1.example.com
# - orderer.example.com
# - ca_org1
```

## Troubleshooting

### Issue: Blockchain service can't connect to Fabric

**Solution**:
```bash
# Check if Fabric network is running
cd fabric-samples/test-network
./network.sh down
./network.sh up createChannel -c eazepay-channel -ca
./network.sh deployCC -ccn transaction-ledger -ccp ../chaincode/transaction-ledger -ccl go
```

### Issue: Chaincode not found

**Solution**:
```bash
# Redeploy chaincode
cd fabric-samples/test-network
./network.sh deployCC -ccn transaction-ledger -ccp ../chaincode/transaction-ledger -ccl go
```

### Issue: Connection profile not found

**Solution**:
```bash
# Copy connection profile
cp fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json \
   services/blockchain-service/fabric-network/connection-profile.json
```

## Production Considerations

### 1. Multi-Organization Setup
- Set up multiple organizations (Bank, Regulator, Eazepay)
- Each organization runs their own peer nodes
- Consensus across organizations

### 2. High Availability
- Multiple peer nodes per organization
- Raft consensus for ordering service
- Load balancing across peers

### 3. Security
- TLS for all communication
- Certificate management
- Hardware Security Modules (HSM) for key storage

### 4. Performance
- Batch transactions for better throughput
- Optimize chaincode queries
- Use CouchDB for rich queries

### 5. Backup & Recovery
- Regular backup of ledger data
- Disaster recovery plan
- Peer node redundancy

## Next Steps

1. ✅ **Test the integration** - Create transactions and verify on blockchain
2. ✅ **Monitor performance** - Check transaction throughput
3. ✅ **Add more features** - Smart contracts for compliance
4. ✅ **Scale up** - Add more peer nodes
5. ✅ **Production deployment** - Multi-org setup

## Benefits Achieved

✅ **Immutability**: Transactions cannot be altered
✅ **Transparency**: Full audit trail
✅ **Trust**: Cryptographic proof
✅ **Compliance**: Regulatory requirements met
✅ **Security**: Tamper-evident ledger

## Support

For issues or questions:
1. Check logs: `docker logs afripay-blockchain`
2. Review Hyperledger Fabric docs: https://hyperledger-fabric.readthedocs.io/
3. Check RabbitMQ messages: http://localhost:15673

---

**Congratulations!** Your Eazepay system now has blockchain integration for immutable transaction recording! 🎉
