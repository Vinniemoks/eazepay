# Agent Portal Deployment Guide

## Quick Start

### Development
```bash
cd portals/agent-portal
npm install
npm run dev
```

The portal will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

Build output is in the `build/` directory.

### Preview Production Build
```bash
npm run preview
```

## Environment Configuration

Create a `.env` file in the portal root:

```env
VITE_API_BASE_URL=https://api.eazepay.com
VITE_AGENT_SERVICE_URL=https://api.eazepay.com/agent
VITE_BIOMETRIC_SERVICE_URL=https://api.eazepay.com/biometric
```

## Deployment Options

### Option 1: Static Hosting (Recommended)
Deploy the `build/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages

### Option 2: Docker
```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Node Server
Use `serve` package:
```bash
npm install -g serve
serve -s build -l 3000
```

## Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Use environment variables for API endpoints
- [ ] Enable audit logging

## Performance Optimization

The build is already optimized with:
- Code splitting
- Tree shaking
- Minification
- Source maps for debugging

## Monitoring

Monitor these metrics:
- Page load time
- API response times
- Error rates
- Biometric capture success rate
- Registration completion rate

## Support

For issues, check:
1. Browser console for errors
2. Network tab for API failures
3. Circuit breaker status in app
4. Backend service health
