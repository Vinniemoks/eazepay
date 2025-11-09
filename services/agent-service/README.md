# Agent Service

The Agent Service manages Eazepay's agent network including onboarding, terminal registration, and transaction tracking. It is a Node.js service built with TypeScript and TypeORM.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Environment Variables

Create a `.env` file (already provided) with the following keys:

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port for the service | `8005` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database username | `developer` |
| `DB_PASS` | Database password | `dev_password_2024!` |
| `DB_NAME` | Database name for agent data | `agent_service_dev` |

## Getting Started

```bash
npm install
npm run build
npm run start
```

During development you can use hot reloading:

```bash
npm run dev
```

The health check is available at `http://localhost:8005/health` once the service is running.

## Testing

```bash
npm test
```

## Additional Notes

- Ensure the Identity and Biometric services are running before onboarding new agents for full functionality.
- TypeORM automatically syncs the schema when `NODE_ENV=development`.
