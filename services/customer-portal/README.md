# Customer Portal

Customer-facing web application for Eazepay users to manage their wallets, transactions, and profiles.

## Features

- User authentication (login/register)
- Wallet management and balance viewing
- Money transfers
- Transaction history
- Profile management

## Tech Stack

- React 18
- Vite
- React Router
- Zustand (state management)
- Axios (API calls)

## Development

```bash
npm install
npm run dev
```

Access at http://localhost:3001

## Production Build

```bash
npm run build
docker build -t eazepay/customer-portal .
docker run -p 3001:80 eazepay/customer-portal
```

## Environment Variables

See `.env` file for configuration options.
