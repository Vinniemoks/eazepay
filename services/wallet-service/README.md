# Wallet Service

A Go microservice for digital wallet management in Eazepay.

## Endpoints
- `GET /health` — Health check
- `POST /api/wallets` — Create wallet
- `GET /api/wallets/:id` — Get wallet by ID

## Usage

```bash
# Run the HTTP API (loads configuration from .env if present)
go run .
```

## Docker
See the included Dockerfile for containerization.
