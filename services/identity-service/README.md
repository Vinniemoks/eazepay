# Identity Service

The Identity Service provides user onboarding, authentication, and KYC orchestration for AfriPay. It is built with Node.js, Express, and TypeORM.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Access to the Biometric Service for biometric verification

## Environment Variables

The service reads configuration from `.env`:

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port | `8000` |
| `DB_HOST` | Shared PostgreSQL host | `localhost` |
| `DB_PORT` | Shared PostgreSQL port | `5432` |
| `DB_USER` | Shared PostgreSQL user | `developer` |
| `DB_PASS` | Shared PostgreSQL password | `dev_password_2024!` |
| `DB_NAME` | Shared database name | `afripay_dev` |
| `IDENTITY_DB_NAME` | Identity-specific schema/database | `identity_service_dev` |
| `IDENTITY_DB_USER` | Identity-specific DB user | `developer` |
| `IDENTITY_DB_PASS` | Identity-specific DB password | `dev_password_2024!` |
| `JWT_SECRET` | Secret key for signing JWTs | `super_secret_jwt_key_change_me` |
| `JWT_EXPIRES_IN` | JWT expiration window | `1h` |
| `SKIP_DB_INIT` | Set to `true` to start the API without connecting to PostgreSQL (useful for local smoke tests) | `false` |
| `BIOMETRIC_SERVICE_URL` | URL of the Biometric Service | `http://localhost:8001` |
| `TRANSACTION_SERVICE_URL` | URL of the Transaction Service | `http://localhost:8002` |
| `WALLET_SERVICE_URL` | URL of the Wallet Service | `http://localhost:8003` |

## Setup

```bash
npm install
npm run build
npm run start
```

For development with hot reload:

```bash
npm run dev
```

> **Tip:** When you want to run the service without a local PostgreSQL instance (for example, to quickly verify the HTTP layer), export `SKIP_DB_INIT=true` before starting the server. The service will skip database initialization but still honour port settings from `.env`.

## Database Migrations

TypeORM is configured to synchronize the schema automatically when `NODE_ENV=development`. For production use migrations to manage schema changes.

## Testing

```bash
npm test
```

## Health Check

`GET http://localhost:8000/health` returns service status information.
