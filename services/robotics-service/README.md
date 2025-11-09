# Robotics Service

Eazepay Robotics Service for managing robotic payment terminals and automated transaction processing.

## Features

- Robotic terminal management
- Automated transaction processing
- Device monitoring and control
- Integration with transaction and identity services

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
PORT=8040
LOG_LEVEL=info
TRANSACTION_SERVICE_URL=http://transaction-service:8002
IDENTITY_SERVICE_URL=http://identity-service:8000
```

## Running

```bash
npm install
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/robots/register` - Register new robot
- `GET /api/robots/:id` - Get robot details
- `POST /api/robots/:id/transaction` - Process transaction

## Development

```bash
npm run dev
```
