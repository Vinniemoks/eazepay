# Wallet Service

A Go microservice for digital wallet management in AfriPay.

## Endpoints
- `GET /health` — Health check
- `POST /api/wallets` — Create wallet
- `GET /api/wallets/:id` — Get wallet by ID

## Usage

```bash
# Install dependencies
 go mod tidy
# Run service
 go run main.go
```

## Docker
See the included Dockerfile for containerization.
