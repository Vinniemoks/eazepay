# Eazepay Desktop App

Electron-based desktop application for Eazepay payment platform.

## Features

- 🔐 Secure authentication
- 💰 Wallet management
- 📊 Transaction history
- 🖥️ Native desktop experience
- 🔄 Auto-updates
- 💾 Offline support

## Quick Start

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Build for production
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

## Configuration

Copy `.env.example` to `.env` and configure:
```env
API_URL=http://localhost:8000
```

## Build Output

- Windows: `release/Eazepay Setup.exe`
- macOS: `release/Eazepay.dmg`
- Linux: `release/Eazepay.AppImage`

## Documentation

See [APPS_SETUP_GUIDE.md](../APPS_SETUP_GUIDE.md) for detailed setup instructions.
