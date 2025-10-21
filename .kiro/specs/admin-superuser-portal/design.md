# Design Document: Admin & Superuser Portal with Organizational Hierarchy

## Overview

This document outlines the technical design for an enterprise-grade administrative system featuring real-time dashboards, financial analytics with millisecond-precision timestamps, organizational hierarchy management, and comprehensive access control workflows.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx/ALB)                    │
└────────────┬────────────────────────────────────┬────────────────┘
             │                                    │
    ┌────────▼────────┐                 ┌────────▼────────┐
    │ Superuser Portal│                 │  Admin Portal   │
    │   (React SPA)   │                 │   (React SPA)   │
    └────────┬────────┘                 └────────┬────────┘
             │                                    │
             └──────────────┬─────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   API Gateway   │
                   │  (Auth/Routing) │
                   └────────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│Identity Service│  │Admin Service│  │Financial Service│
│  (Node.js/TS)  │  │ (Node.js/TS)│  │   (Node.js/TS)  │
└───────┬────────┘  └──────┬──────┘  └────────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   PostgreSQL   │  │    Redis    │  │    RabbitMQ     │
│  (Primary DB)  │  │   (Cache)   │  │  (Event Bus)    │
└────────────────┘  └─────────────┘  └─────────────────┘
```

### Real-Time Architecture

```
┌──────────────┐         WebSocket          ┌──────────────┐
│ Admin Portal │◄──────────────────────────►│ WebSocket    │
│   (Browser)  │      (Socket.io/WS)        │   Gateway    │
└──────────────┘                            └──────┬───────┘
                                                   │
                                            ┌──────▼───────┐
                                            │   Redis      │
                                            │   Pub/Sub    │
                                            └──────┬───────┘
                                                   │
                                            ┌──────▼───────┐
                                            │  Event       │
                                            │  Processor   │
                                            └──────┬───────┘
                                                   │
                                            ┌──────▼───────┐
                                            │  RabbitMQ    │
                                            │  (Events)    │
                                            └──────────────┘
```

## Components and Interfaces

### 1. Identity Service

**Responsibilities:**
- User authentication (SSO, MFA)
- Session management
- Permission validation
- Role assignment

**Key Interfaces:**

```typescript
interface IdentityService {
  // Authentication
  authenticateSSO(token: string, provider: 'OIDC' | 'SAML'): Promise<AuthResult>
  verifyMFA(userId: string, code: string, method: 'TOTP' | 'WebAuthn'): Promise<boolean>
  
  // Session Management
  createSession(userId: string, deviceInfo: DeviceInfo): Promise<Session>
  refreshToken(refreshToken: string): Promise<TokenPair>
  revokeSession(sessionId: string): Promise<void>
  
  // Permission Validation
  hasPermission(userId: string, permissionCode: string): Promise<boolean>
  getUserPermissions(userId: string): Promise<PermissionCode[]>
  validatePolicy(userId: string, resource: string, action: string): Promise<PolicyResult>
}

interface AuthResult {
  userId: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  requiresMFA: boolean
}

interface Session {
  id: string
  userId: string
  deviceId: string
  createdAt: Date
  expiresAt: Date
  lastActivity: Date
}
```

### 2. Admin Service

**Responsibilities:**
- Organizational hierarchy management
- Access request workflow
- Permission code registry
- Admin user management

**Key Interfaces:**

```typescript
interface AdminService {
  // Organizational Management
  createAdmin(data: CreateAdminRequest): Promise<Admin>
  updateAdminRole(adminId: string, role: AdminRole): Promise<Admin>
  getOrganizationHierarchy(): Promise<OrgHierarchy>
  
  // Access Requests
  createAccessRequest(request: AccessRequest): Promise<AccessRequestResult>
  approveAccessRequest(requestId: string, approverId: string, reason: string): Promise<void>
  rejectAccessRequest(requestId: string, approverId: string, reason: string): Promise<void>
  getPendingRequests(superuserId: string): Promise<AccessRequest[]>
  
  // Permission Management
  getPermissionCodes(): Promise<PermissionCode[]>
  createPermissionCode(code: PermissionCodeDefinition): Promise<PermissionCode>
  deprecatePermissionCode(code: string, replacementCode: string): Promise<void>
}

interface CreateAdminRequest {
  email: string
  fullName: string
  role: 'MANAGER' | 'EMPLOYEE'
  department: Department
  permissionCodes: string[]
  managerId?: string
}

interface AccessRequest {
  id: string
  requesterId: string
  targetUserId: string
  requestedPermissions: string[]
  justification: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  createdAt: Date
  expiresAt: Date
}

interface PermissionCode {
  code: string // Format: DEPT-RESOURCE-ACTION
  description: string
  department: Department
  resource: string
  action: 'VIEW' | 'EDIT' | 'CREATE' | 'DELETE' | 'APPROVE' | 'EXPORT'
  version: string
  deprecated: boolean
  replacementCode?: string
}
```

### 3. Financial Service

**Responsibilities:**
- Transaction recording with millisecond precision
- Financial analytics and reporting
- Anomaly detection
- Report generation

**Key Interfaces:**

```typescript
interface FinancialService {
  // Transaction Management
  recordTransaction(tx: Transaction): Promise<TransactionResult>
  getTransaction(txId: string): Promise<Transaction>
  searchTransactions(criteria: SearchCriteria): Promise<PaginatedResult<Transaction>>
  
  // Analytics
  getFinancialSummary(period: TimePeriod): Promise<FinancialSummary>
  getDetailedFinancials(filters: FinancialFilters): Promise<DetailedFinancials>
  detectAnomalies(timeRange: TimeRange): Promise<Anomaly[]>
  
  // Reporting
  generateReport(type: ReportType, params: ReportParams): Promise<Report>
  exportTransactions(filters: ExportFilters, format: 'CSV' | 'EXCEL' | 'PDF'): Promise<ExportJob>
}

interface Transaction {
  id: string
  timestamp: string // ISO 8601 with milliseconds: 2025-01-15T14:30:00.123Z
  sequenceNumber: bigint // For millisecond collision resolution
  type: TransactionType
  amount: Decimal
  currency: string
  fromUserId: string
  toUserId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
  fees: Decimal
  metadata: Record<string, any>
  idempotencyKey: string
}

interface FinancialSummary {
  period: TimePeriod
  totalVolume: Decimal
  totalRevenue: Decimal
  totalFees: Decimal
  transactionCount: number
  averageTransactionValue: Decimal
  successRate: number
  comparisonToPrevious: {
    volumeChange: number // percentage
    revenueChange: number
    transactionCountChange: number
  }
}
```

### 4. Real-Time Event Service

**Responsibilities:**
- WebSocket connection management
- Event publishing and subscription
- Notification delivery
- Connection health monitoring

**Key Interfaces:**

```typescript
interface RealtimeService {
  // Connection Management
  handleConnection(socket: WebSocket, userId: string): Promise<void>
  handleDisconnection(socketId: string): Promise<void>
  
  // Event Publishing
  publishEvent(event: SystemEvent): Promise<void>
  publishToUser(userId: string, event: UserEvent): Promise<void>
  publishToRole(role: UserRole, event: RoleEvent): Promise<void>
  
  // Subscription Management
  subscribe(socketId: string, channels: string[]): Promise<void>
  unsubscribe(socketId: string, channels: string[]): Promise<void>
}

interface SystemEvent {
  id: string // UUIDv7
  type: string
  version: string // Schema version
  timestamp: string
  correlationId: string
  payload: any
  metadata: EventMetadata
}

interface EventMetadata {
  source: string
  userId?: string
  traceId: string
  spanId: string
}
```

## Data Models

### User & Admin Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('SUPERUSER', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'AGENT')),
  department VARCHAR(100),
  manager_id UUID REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_users_role (role),
  INDEX idx_users_department (department),
  INDEX idx_users_manager (manager_id),
  INDEX idx_users_status (status)
);

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_code VARCHAR(100) NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id, permission_code),
  INDEX idx_user_permissions_user (user_id),
  INDEX idx_user_permissions_code (permission_code)
);

CREATE TABLE permission_codes (
  code VARCHAR(100) PRIMARY KEY,
  description TEXT NOT NULL,
  department VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  deprecated BOOLEAN NOT NULL DEFAULT FALSE,
  replacement_code VARCHAR(100) REFERENCES permission_codes(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ,
  
  INDEX idx_permission_codes_dept (department),
  INDEX idx_permission_codes_deprecated (deprecated)
);
```

### Access Request Schema

```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID NOT NULL REFERENCES users(id),
  requested_permissions TEXT[] NOT NULL,
  justification TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  review_reason TEXT,
  
  INDEX idx_access_requests_status (status),
  INDEX idx_access_requests_requester (requester_id),
  INDEX idx_access_requests_target (target_user_id),
  INDEX idx_access_requests_created (created_at DESC)
);
```

### Financial Transaction Schema

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(), -- Millisecond precision
  sequence_number BIGSERIAL NOT NULL, -- For collision resolution
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL,
  fees DECIMAL(15,2) NOT NULL DEFAULT 0,
  metadata JSONB,
  idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
  
  INDEX idx_transactions_timestamp (timestamp DESC),
  INDEX idx_transactions_from_user (from_user_id, timestamp DESC),
  INDEX idx_transactions_to_user (to_user_id, timestamp DESC),
  INDEX idx_transactions_type (type, timestamp DESC),
  INDEX idx_transactions_status (status),
  INDEX idx_transactions_idempotency (idempotency_key)
);

-- Partition by month for performance
CREATE TABLE transactions_2025_01 PARTITION OF transactions
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
  actor_user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  before_value JSONB,
  after_value JSONB,
  ip_address INET,
  user_agent TEXT,
  correlation_id UUID NOT NULL,
  previous_log_hash VARCHAR(64), -- SHA-256 of previous entry
  entry_hash VARCHAR(64) NOT NULL, -- SHA-256 of this entry
  signature TEXT, -- Cryptographic signature
  
  INDEX idx_audit_logs_timestamp (timestamp DESC),
  INDEX idx_audit_logs_actor (actor_user_id, timestamp DESC),
  INDEX idx_audit_logs_action (action_type, timestamp DESC),
  INDEX idx_audit_logs_resource (resource_type, resource_id)
);

-- Make audit logs append-only
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
```

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string // Machine-readable error code
    message: string // Human-readable message
    details?: any // Additional context
    traceId: string // For debugging
    timestamp: string
  }
}

// Example error codes
enum ErrorCode {
  UNAUTHORIZED = 'AUTH_001',
  INSUFFICIENT_PERMISSIONS = 'AUTH_002',
  SESSION_EXPIRED = 'AUTH_003',
  MFA_REQUIRED = 'AUTH_004',
  
  ACCESS_REQUEST_EXPIRED = 'REQ_001',
  INVALID_PERMISSION_CODE = 'REQ_002',
  SEGREGATION_OF_DUTIES_VIOLATION = 'REQ_003',
  
  TRANSACTION_NOT_FOUND = 'FIN_001',
  IDEMPOTENCY_KEY_CONFLICT = 'FIN_002',
  INSUFFICIENT_BALANCE = 'FIN_003',
  
  RATE_LIMIT_EXCEEDED = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  VALIDATION_ERROR = 'SYS_003'
}
```

### Retry Strategy

```typescript
interface RetryConfig {
  maxAttempts: number
  backoffMultiplier: number
  maxBackoffMs: number
  retryableErrors: ErrorCode[]
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  maxBackoffMs: 30000,
  retryableErrors: [
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.RATE_LIMIT_EXCEEDED
  ]
}
```

## Testing Strategy

### Unit Tests
- Permission validation logic
- Timestamp precision handling
- Idempotency key validation
- Policy evaluation (deny-overrides)
- Hash chain integrity

### Integration Tests
- SSO authentication flow
- MFA verification
- Access request approval workflow
- Real-time event delivery
- Transaction recording with millisecond precision

### End-to-End Tests
- Complete access request lifecycle
- Financial report generation
- Dashboard real-time updates
- Session management and refresh
- Audit log integrity verification

### Performance Tests
- API response time (p95 < 300ms)
- Dashboard load time (< 1s)
- WebSocket connection handling (1000 concurrent)
- Transaction throughput (10,000 TPS)
- Query performance on 100M transactions

### Security Tests
- STRIDE threat modeling
- Privilege escalation attempts
- IDOR vulnerability scanning
- SQL injection testing
- XSS and CSRF protection
- Secrets scanning

### Chaos Tests
- Database failover
- Message broker failure
- WebSocket reconnection
- Clock skew handling
- Network partition recovery

## Deployment Architecture

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: admin-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: admin-service
        image: afripay/admin-service:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Database Replication

```
┌─────────────┐
│   Primary   │
│  PostgreSQL │
└──────┬──────┘
       │
       ├──────────┐
       │          │
┌──────▼──────┐ ┌▼──────────┐
│  Replica 1  │ │ Replica 2 │
│  (Read)     │ │  (Read)   │
└─────────────┘ └───────────┘
```

## Security Considerations

### Authentication Flow

```
1. User → SSO Provider (OIDC/SAML)
2. SSO Provider → Identity Service (token)
3. Identity Service → Validate token
4. Identity Service → Check MFA requirement
5. If MFA required → Send TOTP/WebAuthn challenge
6. User → Provide MFA code
7. Identity Service → Verify MFA
8. Identity Service → Create session + tokens
9. Return access token + refresh token
```

### Permission Evaluation

```typescript
function evaluatePermission(
  user: User,
  resource: string,
  action: string
): boolean {
  // 1. Get all applicable policies
  const policies = getPolicies(user, resource, action)
  
  // 2. Check for explicit deny (deny-overrides)
  if (policies.some(p => p.effect === 'DENY')) {
    return false
  }
  
  // 3. Check for explicit allow
  if (policies.some(p => p.effect === 'ALLOW')) {
    return true
  }
  
  // 4. Default deny (least privilege)
  return false
}
```

### Secrets Management

```typescript
interface SecretsManager {
  getSecret(key: string): Promise<string>
  rotateSecret(key: string): Promise<void>
  auditSecretAccess(key: string, accessor: string): Promise<void>
}

// Implementation using AWS Secrets Manager
class AWSSecretsManager implements SecretsManager {
  async getSecret(key: string): Promise<string> {
    const secret = await this.client.getSecretValue({ SecretId: key })
    await this.auditSecretAccess(key, this.currentUser)
    return secret.SecretString
  }
  
  async rotateSecret(key: string): Promise<void> {
    await this.client.rotateSecret({
      SecretId: key,
      RotationLambdaARN: this.rotationLambdaArn
    })
  }
}
```

## Monitoring & Observability

### Key Metrics

```typescript
interface Metrics {
  // Authentication
  authSuccessRate: Gauge
  authFailureCount: Counter
  mfaVerificationTime: Histogram
  sessionDuration: Histogram
  
  // Access Requests
  pendingRequestsCount: Gauge
  requestApprovalTime: Histogram
  requestRejectionRate: Gauge
  expiredRequestsCount: Counter
  
  // Financial
  transactionThroughput: Counter
  transactionLatency: Histogram
  transactionSuccessRate: Gauge
  anomalyDetectionRate: Gauge
  
  // System
  apiResponseTime: Histogram
  websocketConnections: Gauge
  eventQueueDepth: Gauge
  errorRate: Counter
}
```

### Distributed Tracing

```typescript
interface Trace {
  traceId: string // UUIDv4
  spanId: string // UUIDv4
  parentSpanId?: string
  serviceName: string
  operationName: string
  startTime: number // microseconds
  duration: number // microseconds
  tags: Record<string, string>
  logs: TraceLog[]
}

// Example trace propagation
function propagateTrace(req: Request): TraceContext {
  return {
    traceId: req.headers['x-trace-id'] || generateUUID(),
    spanId: generateUUID(),
    parentSpanId: req.headers['x-span-id']
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
interface CacheStrategy {
  // User permissions (TTL: 5 minutes)
  getUserPermissions(userId: string): Promise<PermissionCode[]>
  
  // Financial summary (TTL: 1 minute)
  getFinancialSummary(period: TimePeriod): Promise<FinancialSummary>
  
  // Permission codes (TTL: 1 hour)
  getPermissionCodes(): Promise<PermissionCode[]>
  
  // Invalidation
  invalidateUserCache(userId: string): Promise<void>
  invalidateFinancialCache(): Promise<void>
}
```

### Database Optimization

```sql
-- Materialized view for financial summary
CREATE MATERIALIZED VIEW financial_summary_daily AS
SELECT
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_volume,
  SUM(fees) as total_fees,
  AVG(amount) as avg_transaction_value
FROM transactions
WHERE status = 'COMPLETED'
GROUP BY DATE_TRUNC('day', timestamp);

-- Refresh every 5 minutes
CREATE INDEX ON financial_summary_daily (date DESC);
REFRESH MATERIALIZED VIEW CONCURRENTLY financial_summary_daily;
```

## Migration Strategy

### Zero-Downtime Deployment

1. **Blue-Green Deployment**
   - Deploy new version to "green" environment
   - Run smoke tests
   - Switch traffic to green
   - Keep blue as rollback option

2. **Database Migrations**
   - Use online schema changes (pt-online-schema-change)
   - Add columns as nullable first
   - Backfill data in background
   - Make non-nullable after backfill

3. **Feature Flags**
   - Gradual rollout: 5% → 25% → 50% → 100%
   - Monitor error rates at each stage
   - Automatic rollback on error spike

## Disaster Recovery

### Backup Strategy

```
- Database: Continuous WAL archiving + daily snapshots
- Audit logs: Replicated to S3 with versioning
- Secrets: Backed up to separate vault
- Configuration: Stored in Git with encryption
```

### Recovery Procedures

```
1. Database failure:
   - Promote read replica to primary (< 30 seconds)
   - Update DNS/load balancer
   - Verify data integrity

2. Complete region failure:
   - Failover to secondary region
   - Restore from latest backup
   - Verify audit log integrity
   - Resume operations

3. Data corruption:
   - Identify corruption timestamp
   - Restore from point-in-time backup
   - Replay transactions from audit log
   - Verify financial reconciliation
```

This design provides a robust, scalable, and secure foundation for the enterprise admin/superuser portal system.
