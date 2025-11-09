# Eazepay Admin Portal

Enterprise-grade admin portal for superusers and administrators with royal yellow/gold theme.

## Features

- 🎨 **Royal Theme**: Yellow and gold color scheme with smooth gradients
- 🌓 **Dark/Light Mode**: Toggle between themes with smooth transitions
- ☀️ **Brightness Control**: Adjust brightness manually or auto-adjust by time
- 📱 **Responsive Design**: Works on all screen sizes
- 🔐 **Role-Based Access**: Different views for superusers and admins
- ⚡ **Fast & Modern**: Built with React 18 and Vite

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Theme System

The portal includes an advanced theme system with:
- Light and dark modes
- Brightness adjustment (-30 to +30)
- Auto-adjust based on time of day
- Smooth transitions between themes
- Persistent preferences

## User Roles

### Superuser
- Full system access
- User management
- Permission management
- Organization structure
- Audit logs
- System settings

### Admin/Manager
- Team management
- Access request approval
- Department analytics
- Profile management

## Development

```bash
npm run dev    # Start dev server on port 3001
npm run build  # Build for production
npm run preview # Preview production build
```

## Docker

```bash
docker build -t eazepay-admin-portal .
docker run -p 3001:80 eazepay-admin-portal
```

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Eazepay Admin Portal
```

## Color Palette

- Primary Gold: #F59E0B
- Royal Gold: #FFC107
- Dark Background: #0A0A0A
- Light Background: #FAFAFA
