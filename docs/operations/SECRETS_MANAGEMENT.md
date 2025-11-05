# Secrets Management Guide

This document outlines how to securely manage secrets in the Eazepay platform.

## Overview

Secrets include:
- Database passwords
- API keys
- JWT secrets
- Encryption keys
- SSL certificates
- Third-party service credentials

## Secrets Management Solutions

### Recommended: AWS Secrets Manager

**Setup:**
```bash
# Install AWS CLI
aws configure

# Create secret
aws secretsmanager create-secret \
  --name eazepay/production/database \
  --secret-string '{"username":"admin","password":"secure_password"}'

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id eazepay/production/database \
  --query SecretString \
  --output text
```

**Integration with Kubernetes:**
```yaml
# Use External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-secret
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: database-credentials
  data:
    - secretKey: password
      remoteRef:
        key: eazepay/production/database
        property: password
```

### Alternative: HashiCorp Vault

**Setup:**
```bash
# Install Vault
vault server -dev

# Enable KV secrets engine
vault secrets enable -path=eazepay kv-v2

# Store secret
vault kv put eazepay/production/database \
  username=admin \
  password=secure_password

# Retrieve secret
vault kv get eazepay/production/database
```

**Integration:**
```yaml
# Vault injector for Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-service
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "identity-service"
        vault.hashicorp.com/agent-inject-secret-database: "eazepay/production/database"
```

### Alternative: Environment Variables (Not Recommended for Production)

**Use only for:**
- Local development
- CI/CD pipelines (with GitHub Secrets)
- Temporary configurations

## Secret Organization

### Naming Convention

```
{platform}/{environment}/{service}/{resource}
```

**Examples:**
- `eazepay/production/database/postgres`
- `eazepay/staging/identity-service/jwt`
- `eazepay/production/biometric-service/encryption`

### Environment Separation

- **Development**: `eazepay/dev/*`
- **Staging**: `eazepay/staging/*`
- **Production**: `eazepay/production/*`

## Secret Rotation

### Automated Rotation

**AWS Secrets Manager:**
```bash
# Create rotation function
aws secretsmanager create-secret \
  --name eazepay/production/database \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:RotateSecret \
  --rotation-rules AutomaticallyAfterDays=30
```

### Manual Rotation

**Procedure:**

1. **Generate New Secret:**
   ```bash
   # Generate new password
   NEW_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Update Secret:**
   ```bash
   # Update in secrets manager
   aws secretsmanager update-secret \
     --secret-id eazepay/production/database \
     --secret-string "{\"password\":\"$NEW_PASSWORD\"}"
   ```

3. **Update Application:**
   ```bash
   # Restart services to pick up new secret
   kubectl rollout restart deployment/identity-service
   ```

4. **Verify:**
   ```bash
   # Test connectivity
   psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB
   ```

5. **Cleanup:**
   ```bash
   # Remove old secret (after verification period)
   ```

### Rotation Schedule

- **Database passwords**: Every 90 days
- **API keys**: Every 180 days
- **JWT secrets**: Every 90 days
- **Encryption keys**: Every 365 days (requires re-encryption)

## Secret Access Control

### IAM Roles / RBAC

**AWS:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:region:account:secret:eazepay/production/*"
    }
  ]
}
```

**Kubernetes:**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["database-credentials"]
  verbs: ["get"]
```

### Audit Logging

**Enable audit logs:**
```bash
# AWS CloudTrail
# Monitor all secrets manager API calls

# Kubernetes Audit
# Log secret access
```

## Application Integration

### Node.js Services

```javascript
// Using AWS SDK
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}

// Usage
const dbConfig = await getSecret('eazepay/production/database');
const dbPassword = dbConfig.password;
```

### Java Services

```java
// Using AWS SDK
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

public class SecretManager {
    private SecretsManagerClient client;
    
    public String getSecret(String secretName) {
        GetSecretValueRequest request = GetSecretValueRequest.builder()
            .secretId(secretName)
            .build();
        
        return client.getSecretValue(request).secretString();
    }
}
```

### Python Services

```python
# Using boto3
import boto3
import json

secrets_client = boto3.client('secretsmanager')

def get_secret(secret_name):
    response = secrets_client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Usage
db_config = get_secret('eazepay/production/database')
db_password = db_config['password']
```

## Emergency Procedures

### Secret Compromise

**Immediate Actions:**

1. **Rotate Immediately:**
   ```bash
   # Generate new secret
   NEW_SECRET=$(openssl rand -base64 32)
   
   # Update immediately
   aws secretsmanager update-secret \
     --secret-id eazepay/production/database \
     --secret-string "{\"password\":\"$NEW_SECRET\"}"
   ```

2. **Revoke Access:**
   ```bash
   # Revoke IAM keys
   # Revoke API keys
   # Update firewall rules
   ```

3. **Investigate:**
   - Review audit logs
   - Identify breach scope
   - Document incident

4. **Notify:**
   - Security team
   - Affected services
   - Management

### Secret Loss

**If secret is lost:**

1. **Check backups**
2. **Check documentation**
3. **Generate new secret**
4. **Update all systems**

## Best Practices

1. **Never commit secrets to version control**
   - Use `.gitignore` for `.env` files
   - Use pre-commit hooks
   - Scan for secrets in code

2. **Use least privilege**
   - Grant minimum required access
   - Rotate credentials regularly

3. **Encrypt secrets at rest**
   - Use encryption provided by secrets manager
   - Use additional encryption if needed

4. **Monitor secret access**
   - Enable audit logging
   - Alert on unusual access patterns

5. **Document secret locations**
   - Maintain inventory
   - Document rotation procedures

6. **Test secret rotation**
   - Test in staging first
   - Have rollback plan

## Secret Inventory

### Production Secrets

| Secret Name | Type | Location | Rotation Schedule |
|------------|------|----------|-------------------|
| Database Password | Password | AWS Secrets Manager | 90 days |
| JWT Secret | Key | AWS Secrets Manager | 90 days |
| Encryption Key | Key | AWS Secrets Manager | 365 days |
| API Keys | Keys | AWS Secrets Manager | 180 days |
| SSL Certificates | Certificates | AWS Certificate Manager | Auto-renewal |

## Tools and Scripts

### Secret Generation

```bash
#!/bin/bash
# generate-secret.sh

# Generate random password
openssl rand -base64 32

# Generate JWT secret
openssl rand -hex 32

# Generate encryption key (32 bytes)
openssl rand -hex 16
```

### Secret Rotation Script

```bash
#!/bin/bash
# rotate-secret.sh

SECRET_NAME=$1
NEW_SECRET=$(openssl rand -base64 32)

aws secretsmanager update-secret \
  --secret-id $SECRET_NAME \
  --secret-string "{\"password\":\"$NEW_SECRET\"}"

echo "Secret rotated. Restart services to apply."
```

---

**Last Updated**: 2025-01-XX
**Next Review**: Quarterly
**Version**: 1.0.0

