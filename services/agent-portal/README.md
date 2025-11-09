# Agent Portal

Agent-facing web application for Eazepay agents to manage customers, transactions, and commissions.

## Features

- Agent authentication
- Customer registration and management
- Transaction processing
- Commission tracking
- Dashboard with analytics

## Tech Stack

- React 18
- Vite
- React Router
- Zustand (state management)
- Recharts (data visualization)

## Development

```bash
npm install
npm run dev
```

Access at http://localhost:3002

## Production Build

```bash
npm run build
docker build -t eazepay/agent-portal .
docker run -p 3002:80 eazepay/agent-portal
```
