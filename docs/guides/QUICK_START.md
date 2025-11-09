# Quick Start Guide

## ✅ Portals Are Built and Ready!

Your customer and agent portals have been successfully built and are ready to deploy.

## Option 1: Start Just the Portals (Fastest)

If you just want to test the frontend portals:

```bash
# Start the portals
docker-compose up -d customer-portal agent-portal

# Access them at:
# Customer Portal: http://localhost:3001
# Agent Portal: http://localhost:3002
```

## Option 2: Start Everything (Full Stack)

To run the complete Eazepay platform with all services:

```bash
# Start all services (this will take a few minutes)
docker-compose up -d

# Wait for services to be ready (about 2-3 minutes)
# Then access:
```

**Frontend Applications:**
- Customer Portal: http://localhost:3001
- Agent Portal: http://localhost:3002
- Admin Portal: http://localhost:8080

**Backend Services:**
- API Gateway: http://localhost:80
- Identity Service: http://localhost:8000
- Biometric Service: http://localhost:8001
- Transaction Service: http://localhost:8002
- Wallet Service: http://localhost:8003
- USSD Service: http://localhost:8004
- Agent Service: http://localhost:8005

**Infrastructure:**
- Grafana: http://localhost:3000 (admin/grafana_admin_2024!)
- RabbitMQ: http://localhost:15673 (admin/rabbitmq_password_2024!)
- Prometheus: http://localhost:9090

## Useful Commands

```bash
# Check service status
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f customer-portal

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild a specific service
docker-compose build customer-portal
docker-compose up -d customer-portal
```

## Troubleshooting

### Services not responding?
Wait a bit longer - backend services can take 2-3 minutes to fully start, especially on first run.

```bash
# Check which services are running
docker-compose ps

# Check logs for errors
docker-compose logs identity-service
```

### Port already in use?
If you get port conflicts, you can modify the ports in `docker-compose.yml` or stop the conflicting service.

### Need to rebuild?
```bash
# Rebuild everything
docker-compose build

# Rebuild specific service
docker-compose build customer-portal
```

## Next Steps

Once everything is running:

1. **Test Customer Portal**: 
   - Visit http://localhost:3001
   - Try registering a new user
   - Explore the wallet and transaction features

2. **Test Agent Portal**:
   - Visit http://localhost:3002
   - Login with agent credentials
   - Explore the dashboard and customer management

3. **Check Monitoring**:
   - Visit Grafana at http://localhost:3000
   - View service metrics and logs

4. **Ready for Cloud?**
   - See `DEPLOYMENT_GUIDE.md` for AWS/GCP deployment
   - See `docs/deployment/AWS_DEPLOYMENT.md` for AWS specifics
   - See `docs/deployment/GCP_DEPLOYMENT.md` for GCP specifics

## Support

- Full documentation: See `GETTING_STARTED.md`
- Cloud deployment: See `DEPLOYMENT_GUIDE.md`
- Project structure: See `PROJECT_STRUCTURE.md`
