# Production Deployment Runbook

This document provides step-by-step procedures for deploying Eazepay to production.

## Pre-Deployment Checklist

- [ ] All tests passing in CI/CD
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Secrets configured in secrets manager
- [ ] SSL certificates obtained
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

## Deployment Steps

### 1. Pre-Deployment

```bash
# 1. Verify current production state
kubectl get pods -n production
docker-compose ps

# 2. Check database health
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT version();"

# 3. Verify secrets are accessible
# (AWS Secrets Manager)
aws secretsmanager get-secret-value --secret-id eazepay/production/db

# 4. Review recent changes
git log --oneline -10

# 5. Tag the release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### 2. Database Migration

```bash
# 1. Backup current database
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations in staging first
cd services/identity-service
npm run migration:run

# 3. Verify migration success
npm run migration:show

# 4. Run production migrations (during maintenance window)
# Repeat for each service with migrations
```

### 3. Build Docker Images

```bash
# Build all service images
for service in identity-service biometric-service transaction-service wallet-service agent-service ussd-service; do
  docker build -t eazepay/$service:latest -t eazepay/$service:v1.0.0 ./services/$service
done

# Tag and push to registry
for service in identity-service biometric-service transaction-service wallet-service agent-service ussd-service; do
  docker tag eazepay/$service:v1.0.0 $DOCKER_REGISTRY/eazepay/$service:v1.0.0
  docker push $DOCKER_REGISTRY/eazepay/$service:v1.0.0
done
```

### 4. Kubernetes Deployment

```bash
# 1. Update image tags in deployment manifests
kubectl set image deployment/identity-service identity-service=$DOCKER_REGISTRY/eazepay/identity-service:v1.0.0 -n production

# 2. Apply configuration updates
kubectl apply -f infrastructure/kubernetes/

# 3. Rolling update (zero-downtime)
kubectl rollout restart deployment/identity-service -n production
kubectl rollout status deployment/identity-service -n production

# 4. Verify deployments
kubectl get deployments -n production
kubectl get pods -n production
```

### 5. Docker Compose Deployment

```bash
# 1. Pull latest images
docker-compose pull

# 2. Stop services gracefully
docker-compose stop

# 3. Start with new images
docker-compose up -d

# 4. Verify health
./scripts/health-check.sh
```

### 6. Post-Deployment Verification

```bash
# 1. Health checks
curl https://api.eazepay.com/health
curl https://identity.eazepay.com/health
curl https://transactions.eazepay.com/actuator/health

# 2. Smoke tests
npm run test:smoke

# 3. Check logs
kubectl logs -f deployment/identity-service -n production
docker-compose logs -f identity-service

# 4. Monitor metrics
# Check Grafana dashboards
# Verify Prometheus metrics

# 5. Test critical user flows
# - User registration
# - Transaction processing
# - Wallet operations
```

## Rollback Procedures

### Quick Rollback (< 5 minutes)

```bash
# Kubernetes
kubectl rollout undo deployment/identity-service -n production

# Docker Compose
docker-compose down
docker-compose up -d --scale identity-service=0
# Restore previous version
docker-compose up -d
```

### Database Rollback

```bash
# 1. Stop accepting new transactions (if possible)

# 2. Restore database backup
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB < backup_YYYYMMDD_HHMMSS.sql

# 3. Rollback migrations
cd services/identity-service
npm run migration:revert
```

### Complete Rollback

```bash
# 1. Revert code
git revert HEAD
git push origin main

# 2. Rebuild and redeploy previous version
./scripts/deploy.sh --version previous

# 3. Restore database
# (See Database Rollback section)

# 4. Verify system health
./scripts/health-check.sh
```

## Service-Specific Deployment

### Identity Service

```bash
# Deployment order matters - deploy this first
kubectl apply -f infrastructure/kubernetes/identity-service-deployment.yaml
kubectl rollout status deployment/identity-service -n production

# Verify
curl https://identity.eazepay.com/health
```

### Transaction Service

```bash
# Deploy after Identity Service is healthy
kubectl apply -f infrastructure/kubernetes/transaction-service-deployment.yaml
kubectl rollout status deployment/transaction-service -n production

# Verify
curl https://transactions.eazepay.com/actuator/health
```

### Frontend Portals

```bash
# Build and deploy static assets
cd services/admin-portal
npm run build
# Deploy to CDN/S3
aws s3 sync dist/ s3://eazepay-admin-portal --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
```

## Monitoring During Deployment

### Key Metrics to Watch

1. **Error Rate**: Should remain < 0.1%
2. **Response Time**: Should remain < 100ms p95
3. **Database Connections**: Should not spike
4. **Memory Usage**: Should remain stable
5. **CPU Usage**: Should not exceed 80%

### Alert Conditions

- Error rate > 1%
- Response time > 500ms
- Service unavailable
- Database connection failures
- High memory usage (> 90%)

## Troubleshooting

### Service Won't Start

```bash
# Check logs
kubectl logs deployment/identity-service -n production
docker-compose logs identity-service

# Check resource limits
kubectl describe pod <pod-name> -n production

# Check environment variables
kubectl exec deployment/identity-service -n production -- env
```

### Database Connection Issues

```bash
# Test connection
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB

# Check connection pool
# (In PostgreSQL)
SELECT count(*) FROM pg_stat_activity;
```

### Performance Degradation

```bash
# Check resource usage
kubectl top pods -n production

# Check slow queries
# (In PostgreSQL)
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check application logs for errors
kubectl logs -f deployment/identity-service -n production | grep ERROR
```

## Maintenance Windows

### Scheduled Maintenance

1. Notify users 48 hours in advance
2. Put system in maintenance mode
3. Perform updates
4. Run health checks
5. Remove maintenance mode

### Emergency Maintenance

1. Immediately put system in maintenance mode
2. Investigate issue
3. Apply fix
4. Verify resolution
5. Remove maintenance mode
6. Post-mortem

## Communication

### Pre-Deployment

- Email to team: "Deployment scheduled for [DATE] at [TIME]"
- Slack notification: "@channel Production deployment in 1 hour"

### During Deployment

- Status updates every 5 minutes
- Any issues immediately communicated

### Post-Deployment

- Success notification
- Release notes
- Known issues (if any)

## Contact Information

- **On-Call Engineer**: [Contact Info]
- **DevOps Lead**: [Contact Info]
- **Escalation**: [Contact Info]

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

