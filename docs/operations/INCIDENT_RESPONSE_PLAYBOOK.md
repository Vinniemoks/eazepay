# Incident Response Playbook

This document provides procedures for responding to incidents in the Eazepay platform.

## Incident Classification

### Severity Levels

**P0 - Critical (Immediate Response)**
- Complete service outage
- Data breach
- Security incident
- Data loss
- Payment processing failure

**P1 - High (Response within 1 hour)**
- Partial service outage
- Performance degradation (>50%)
- Authentication failures
- Database connection issues

**P2 - Medium (Response within 4 hours)**
- Minor performance issues
- Non-critical feature failures
- Monitoring alerts

**P3 - Low (Response within 24 hours)**
- Cosmetic issues
- Minor bugs
- Documentation updates

## Incident Response Process

### 1. Detection

**Sources:**
- Monitoring alerts
- User reports
- Automated tests
- Log analysis

**Initial Assessment:**
```bash
# Check service health
./scripts/health-check.sh

# Check logs
kubectl logs -f deployment/identity-service -n production

# Check metrics
# (Grafana dashboards)

# Check error rates
# (Prometheus queries)
```

### 2. Triage

**Information to Gather:**
- What is affected?
- When did it start?
- How many users impacted?
- What is the error?
- Is it getting worse?

**Triage Checklist:**
- [ ] Identify affected services
- [ ] Determine severity level
- [ ] Check recent deployments
- [ ] Review recent changes
- [ ] Check dependencies
- [ ] Assess user impact

### 3. Communication

**Internal Communication:**
```
# Slack channel: #incidents
[P0] Service outage detected
Status: Investigating
Affected: Identity Service
Impact: User authentication failing
Time: 2025-01-XX 10:00 UTC
```

**External Communication (if needed):**
```
Status Page Update:
"We are currently experiencing issues with user authentication.
We are investigating and will provide updates as we learn more."
```

### 4. Containment

**Immediate Actions:**
```bash
# Enable maintenance mode
kubectl apply -f infrastructure/maintenance-mode.yaml

# Or via application
curl -X POST https://api.eazepay.com/admin/maintenance-mode/enable

# Stop accepting new transactions (if financial)
# (Via feature flag or load balancer)
```

### 5. Investigation

**Investigation Steps:**

1. **Check Logs:**
   ```bash
   # Recent errors
   kubectl logs deployment/identity-service -n production | grep ERROR | tail -20
   
   # Application logs
   docker-compose logs identity-service | grep ERROR
   ```

2. **Check Metrics:**
   ```bash
   # Query Prometheus
   rate(http_requests_total{status=~"5.."}[5m])
   
   # Check database connections
   psql -h $POSTGRES_HOST -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. **Check Recent Changes:**
   ```bash
   git log --oneline -10
   git diff HEAD~1
   ```

4. **Check Dependencies:**
   ```bash
   # Database
   psql -h $POSTGRES_HOST -c "SELECT version();"
   
   # Redis
   redis-cli -h $REDIS_HOST ping
   
   # External services
   curl https://api.external-service.com/health
   ```

### 6. Resolution

**Resolution Steps:**

1. **Identify Root Cause:**
   - Code bug
   - Configuration error
   - Infrastructure issue
   - Dependency failure

2. **Implement Fix:**
   ```bash
   # Hotfix deployment
   git checkout -b hotfix/incident-YYYYMMDD
   # Make fix
   git commit -m "Fix: [description]"
   git push origin hotfix/incident-YYYYMMDD
   
   # Deploy
   ./scripts/deploy.sh --hotfix
   ```

3. **Verify Fix:**
   ```bash
   # Health checks
   ./scripts/health-check.sh
   
   # Smoke tests
   npm run test:smoke
   
   # Monitor metrics
   # (Grafana dashboards)
   ```

4. **Disable Maintenance Mode:**
   ```bash
   kubectl delete -f infrastructure/maintenance-mode.yaml
   # Or via application
   curl -X POST https://api.eazepay.com/admin/maintenance-mode/disable
   ```

### 7. Post-Incident

**Post-Incident Tasks:**

1. **Incident Report:**
   - Timeline
   - Root cause
   - Impact
   - Resolution
   - Lessons learned

2. **Action Items:**
   - Preventive measures
   - Monitoring improvements
   - Process improvements
   - Documentation updates

3. **Follow-up:**
   - Schedule post-mortem
   - Assign action items
   - Update runbooks

## Common Incident Scenarios

### Scenario 1: Database Connection Failure

**Symptoms:**
- "Connection refused" errors
- High database connection count
- Timeout errors

**Investigation:**
```bash
# Check database
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB

# Check connection pool
psql -h $POSTGRES_HOST -c "SELECT count(*) FROM pg_stat_activity;"

# Check max connections
psql -h $POSTGRES_HOST -c "SHOW max_connections;"
```

**Resolution:**
```bash
# Increase connection pool
# Or restart database
# Or scale database

# Restart services
kubectl rollout restart deployment/identity-service
```

### Scenario 2: High Memory Usage

**Symptoms:**
- Service crashes
- OOM (Out of Memory) errors
- Slow response times

**Investigation:**
```bash
# Check memory usage
kubectl top pods -n production

# Check application logs
kubectl logs deployment/identity-service -n production | grep -i memory

# Check for memory leaks
# (Using profiling tools)
```

**Resolution:**
```bash
# Increase memory limits
kubectl set resources deployment/identity-service \
  --limits=memory=2Gi \
  -n production

# Or restart services
kubectl rollout restart deployment/identity-service
```

### Scenario 3: Authentication Failures

**Symptoms:**
- Users cannot log in
- JWT validation errors
- Token expiration issues

**Investigation:**
```bash
# Check JWT secret
# (Verify in secrets manager)

# Check token expiration
# (Review JWT configuration)

# Check identity service logs
kubectl logs deployment/identity-service -n production | grep -i auth
```

**Resolution:**
```bash
# Verify JWT secret is correct
# Check token expiration settings
# Restart identity service if needed
```

### Scenario 4: Payment Processing Failure

**Symptoms:**
- Transactions failing
- Payment gateway errors
- Transaction timeouts

**Investigation:**
```bash
# Check transaction service
curl https://transactions.eazepay.com/actuator/health

# Check payment gateway
curl https://payment-gateway.com/health

# Check transaction logs
kubectl logs deployment/transaction-service -n production | grep ERROR
```

**Resolution:**
```bash
# Verify payment gateway connectivity
# Check API keys
# Review transaction logs
# Contact payment gateway support if needed
```

## Escalation Procedures

### Escalation Path

1. **Level 1**: On-Call Engineer
   - Initial response
   - Basic troubleshooting
   - 15 minutes

2. **Level 2**: DevOps Lead
   - Complex issues
   - Infrastructure problems
   - 30 minutes

3. **Level 3**: Engineering Manager
   - Critical issues
   - Business impact
   - 1 hour

4. **Level 4**: CTO
   - Severe incidents
   - Security breaches
   - Immediate

### Escalation Criteria

**Escalate to Level 2 if:**
- No resolution after 30 minutes
- Multiple services affected
- Data integrity concerns

**Escalate to Level 3 if:**
- No resolution after 1 hour
- Significant user impact
- Financial impact

**Escalate to Level 4 if:**
- Security breach
- Data loss
- Extended outage (>2 hours)

## Communication Templates

### Internal Alert

```
[P0] Service Outage
Service: Identity Service
Status: Investigating
Impact: User authentication unavailable
Time: 2025-01-XX 10:00 UTC
On-Call: @engineer
```

### Status Page Update

```
We are currently experiencing issues with [service].
We are investigating and will provide updates every 15 minutes.
```

### Resolution Update

```
[RESOLVED] Service restored
Service: Identity Service
Duration: 45 minutes
Root Cause: Database connection pool exhaustion
Fix: Increased connection pool size
```

## Incident Metrics

**Track:**
- Mean Time to Detection (MTTD)
- Mean Time to Resolution (MTTR)
- Incident frequency
- Incident severity distribution

**Targets:**
- MTTD: < 5 minutes
- MTTR (P0): < 1 hour
- MTTR (P1): < 4 hours

## Tools and Resources

**Monitoring:**
- Grafana dashboards
- Prometheus alerts
- Application logs

**Communication:**
- Slack #incidents channel
- Status page
- Email notifications

**Documentation:**
- Runbooks
- Architecture diagrams
- Contact information

---

**Last Updated**: 2025-01-XX
**Next Review**: Quarterly
**Version**: 1.0.0

