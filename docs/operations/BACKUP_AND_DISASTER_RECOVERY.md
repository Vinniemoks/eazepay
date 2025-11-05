# Backup and Disaster Recovery Plan

This document outlines the backup strategy and disaster recovery procedures for Eazepay.

## Backup Strategy

### Database Backups

#### PostgreSQL Backups

**Automated Backups:**
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Type**: Full database dumps
- **Location**: AWS S3 / GCP Cloud Storage

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_backup_${DATE}.sql.gz"

pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://eazepay-backups/postgres/$BACKUP_FILE

# Remove local backup after upload
rm $BACKUP_FILE
```

**Manual Backups:**
```bash
# Before major deployments
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > pre_deployment_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### MongoDB Backups

**Automated Backups:**
- **Frequency**: Daily at 3:00 AM UTC
- **Retention**: 30 days
- **Type**: Full database dumps

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="mongodb_backup_${DATE}"

mongodump --host $MONGODB_HOST --port $MONGODB_PORT --username $MONGODB_USER --password $MONGODB_PASSWORD --out $BACKUP_DIR

# Compress and upload
tar -czf ${BACKUP_DIR}.tar.gz $BACKUP_DIR
aws s3 cp ${BACKUP_DIR}.tar.gz s3://eazepay-backups/mongodb/${BACKUP_DIR}.tar.gz

rm -rf $BACKUP_DIR ${BACKUP_DIR}.tar.gz
```

### Application State Backups

#### Redis Backups

**Automated Backups:**
- **Frequency**: Every 6 hours
- **Retention**: 7 days
- **Type**: RDB snapshots

```bash
# Redis is configured with:
# save 3600 1  # Save after 1 hour if at least 1 key changed
# save 300 100 # Save after 5 minutes if at least 100 keys changed
```

#### Configuration Backups

- Kubernetes ConfigMaps and Secrets
- Environment variable files
- SSL certificates
- Application configuration files

```bash
# Backup Kubernetes resources
kubectl get configmap -n production -o yaml > configmaps_backup.yaml
kubectl get secret -n production -o yaml > secrets_backup.yaml
```

### Backup Verification

**Automated Verification:**
- Weekly restoration test of random backup
- Verify backup integrity
- Check backup accessibility

```bash
# Verify backup script
#!/bin/bash
BACKUP_FILE=$(aws s3 ls s3://eazepay-backups/postgres/ | tail -1 | awk '{print $4}')

# Download and test restore
aws s3 cp s3://eazepay-backups/postgres/$BACKUP_FILE test_restore.sql.gz
gunzip test_restore.sql.gz

# Test restore to temporary database
createdb test_restore_db
psql test_restore_db < test_restore.sql

# Verify data
psql test_restore_db -c "SELECT count(*) FROM users;"

# Cleanup
dropdb test_restore_db
rm test_restore.sql
```

## Disaster Recovery Plan

### Recovery Objectives

- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour (maximum data loss)

### Disaster Scenarios

#### Scenario 1: Database Corruption

**Symptoms:**
- Database queries failing
- Data inconsistencies
- Application errors

**Recovery Steps:**

1. **Immediate Actions:**
   ```bash
   # Stop accepting new transactions
   # (Via application feature flag or load balancer)
   
   # Identify corruption
   psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "VACUUM FULL ANALYZE;"
   ```

2. **Restore from Backup:**
   ```bash
   # Find latest good backup
   LATEST_BACKUP=$(aws s3 ls s3://eazepay-backups/postgres/ | tail -1 | awk '{print $4}')
   
   # Download backup
   aws s3 cp s3://eazepay-backups/postgres/$LATEST_BACKUP restore.sql.gz
   gunzip restore.sql.gz
   
   # Restore to temporary database
   createdb restore_db
   psql restore_db < restore.sql
   
   # Verify restore
   psql restore_db -c "SELECT count(*) FROM users;"
   
   # Switch to restored database
   # (Procedure depends on setup - may need to swap databases)
   ```

3. **Post-Recovery:**
   - Verify all services
   - Run smoke tests
   - Monitor for 24 hours

#### Scenario 2: Complete Infrastructure Failure

**Symptoms:**
- All services down
- No access to infrastructure
- Complete data center failure

**Recovery Steps:**

1. **Assess Damage:**
   - Identify what's available
   - Check backup accessibility
   - Verify secondary infrastructure

2. **Infrastructure Recovery:**
   ```bash
   # Spin up new infrastructure
   terraform apply -var-file=production.tfvars
   
   # Or restore from infrastructure backup
   terraform import ...
   ```

3. **Data Recovery:**
   ```bash
   # Restore databases
   # (See Database Corruption scenario)
   
   # Restore application state
   # Restore Redis from backup
   # Restore configuration files
   ```

4. **Service Recovery:**
   ```bash
   # Deploy all services
   kubectl apply -f infrastructure/kubernetes/
   
   # Verify health
   ./scripts/health-check.sh
   ```

5. **Data Sync:**
   - Verify data consistency
   - Replay any missed transactions (if possible)
   - Update external systems

#### Scenario 3: Security Breach

**Symptoms:**
- Unauthorized access detected
- Data exfiltration
- Malicious activity

**Recovery Steps:**

1. **Immediate Actions:**
   ```bash
   # Isolate affected systems
   # Revoke all credentials
   # Enable maintenance mode
   ```

2. **Investigation:**
   - Identify breach scope
   - Determine affected data
   - Document incident

3. **Containment:**
   ```bash
   # Rotate all secrets
   # Revoke compromised credentials
   # Patch vulnerabilities
   ```

4. **Recovery:**
   ```bash
   # Restore from clean backup (pre-breach)
   # Verify data integrity
   # Re-enable services
   ```

5. **Post-Incident:**
   - Security audit
   - Update procedures
   - Notify stakeholders (if required by law)

### Failover Procedures

#### Database Failover

**Primary → Secondary:**
```bash
# Promote secondary to primary
# Update connection strings
# Verify replication
```

#### Application Failover

**Region A → Region B:**
```bash
# Update DNS/load balancer
# Route traffic to secondary region
# Monitor health
```

### Recovery Testing

**Quarterly DR Drills:**

1. **Test Backup Restoration:**
   - Restore random backup
   - Verify data integrity
   - Test application connectivity

2. **Full DR Test:**
   - Simulate complete failure
   - Execute recovery procedures
   - Measure RTO/RPO
   - Document lessons learned

**Test Schedule:**
- Monthly: Backup verification
- Quarterly: Partial DR test
- Annually: Full DR test

## Backup Storage

### Storage Locations

1. **Primary**: AWS S3 / GCP Cloud Storage
   - Region: us-east-1 / us-central1
   - Storage class: Standard
   - Encryption: AES-256

2. **Secondary**: Cross-region replica
   - Region: us-west-2 / us-east4
   - Storage class: Standard-IA
   - Encryption: AES-256

3. **Tertiary**: Off-site backup (quarterly)
   - Location: Secure off-site facility
   - Format: Encrypted tapes/disks

### Backup Retention

- **Daily backups**: 30 days
- **Weekly backups**: 12 weeks
- **Monthly backups**: 12 months
- **Yearly backups**: 7 years

## Monitoring and Alerts

### Backup Monitoring

**Alerts:**
- Backup failure
- Backup delay
- Backup size anomalies
- Backup verification failure

```yaml
# Prometheus alert rule
- alert: BackupFailure
  expr: backup_job_failure_count > 0
  for: 5m
  annotations:
    summary: "Backup job failed"
    description: "Backup job {{ $labels.job }} failed"
```

### DR Monitoring

**Metrics:**
- Backup success rate
- Backup size
- Backup duration
- Restore test success rate

## Contact Information

**Backup Team:**
- Primary: [Contact]
- Secondary: [Contact]

**DR Team:**
- Incident Commander: [Contact]
- Technical Lead: [Contact]
- Communications Lead: [Contact]

**Escalation:**
- Level 1: Backup Team
- Level 2: DevOps Lead
- Level 3: CTO

---

**Last Updated**: 2025-01-XX
**Next Review**: Quarterly
**Version**: 1.0.0

