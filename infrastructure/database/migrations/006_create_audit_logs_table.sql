-- Migration: Create audit_logs table with tamper-evident design
-- Task: 1.6 - Create audit_logs table with tamper-evident design
-- Requirements: 1.5, 11.1, 11.2, 14.9, 14.10

-- Create action type enum
CREATE TYPE audit_action_type AS ENUM (
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
    'PERMISSION_GRANTED', 'PERMISSION_REVOKED',
    'ACCESS_REQUEST_CREATED', 'ACCESS_REQUEST_APPROVED', 'ACCESS_REQUEST_REJECTED',
    'TRANSACTION_CREATED', 'TRANSACTION_UPDATED',
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
    'MFA_ENABLED', 'MFA_DISABLED', 'MFA_VERIFIED',
    'SESSION_CREATED', 'SESSION_REVOKED',
    'PERMISSION_CODE_CREATED', 'PERMISSION_CODE_DEPRECATED',
    'SYSTEM_CONFIG_CHANGED', 'EMERGENCY_ACCESS_GRANTED'
);

-- Create audit_logs table (append-only, tamper-evident)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Timestamp with millisecond precision
    timestamp TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
    
    -- Actor information
    actor_user_id UUID NOT NULL REFERENCES users(id),
    actor_role user_role NOT NULL,
    actor_ip_address INET,
    actor_user_agent TEXT,
    
    -- Action details
    action_type audit_action_type NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    
    -- Change tracking
    before_value JSONB,
    after_value JSONB,
    
    -- Tracing
    correlation_id UUID NOT NULL,
    trace_id UUID,
    
    -- Tamper-evident hash chain
    previous_log_hash VARCHAR(64), -- SHA-256 of previous entry
    entry_hash VARCHAR(64) NOT NULL, -- SHA-256 of this entry
    signature TEXT, -- Cryptographic signature
    
    -- Additional context
    metadata JSONB,
    
    -- Constraints
    CONSTRAINT check_hash_format CHECK (
        entry_hash ~ '^[a-f0-9]{64}$' AND
        (previous_log_hash IS NULL OR previous_log_hash ~ '^[a-f0-9]{64}$')
    )
) PARTITION BY RANGE (timestamp);

-- Create partitions for audit logs (monthly)
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Create indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_correlation ON audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_trace ON audit_logs(trace_id);

-- Make audit logs append-only (WORM - Write Once Read Many)
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Create function to calculate entry hash
CREATE OR REPLACE FUNCTION calculate_audit_log_hash(
    p_timestamp TIMESTAMPTZ,
    p_actor_user_id UUID,
    p_action_type audit_action_type,
    p_resource_type VARCHAR,
    p_resource_id VARCHAR,
    p_before_value JSONB,
    p_after_value JSONB,
    p_previous_hash VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
    v_hash_input TEXT;
BEGIN
    -- Concatenate all fields for hashing
    v_hash_input := CONCAT(
        p_timestamp::TEXT, '|',
        p_actor_user_id::TEXT, '|',
        p_action_type::TEXT, '|',
        p_resource_type, '|',
        COALESCE(p_resource_id, ''), '|',
        COALESCE(p_before_value::TEXT, ''), '|',
        COALESCE(p_after_value::TEXT, ''), '|',
        COALESCE(p_previous_hash, '')
    );
    
    -- Return SHA-256 hash
    RETURN encode(digest(v_hash_input, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to insert audit log with hash chain
CREATE OR REPLACE FUNCTION insert_audit_log(
    p_actor_user_id UUID,
    p_action_type audit_action_type,
    p_resource_type VARCHAR,
    p_resource_id VARCHAR DEFAULT NULL,
    p_before_value JSONB DEFAULT NULL,
    p_after_value JSONB DEFAULT NULL,
    p_correlation_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    v_previous_hash VARCHAR(64);
    v_entry_hash VARCHAR(64);
    v_timestamp TIMESTAMPTZ(3);
    v_actor_role user_role;
    v_log_id BIGINT;
BEGIN
    -- Get current timestamp
    v_timestamp := NOW();
    
    -- Get actor role
    SELECT role INTO v_actor_role FROM users WHERE id = p_actor_user_id;
    
    -- Get previous log hash
    SELECT entry_hash INTO v_previous_hash
    FROM audit_logs
    ORDER BY id DESC
    LIMIT 1;
    
    -- Calculate entry hash
    v_entry_hash := calculate_audit_log_hash(
        v_timestamp,
        p_actor_user_id,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_before_value,
        p_after_value,
        v_previous_hash
    );
    
    -- Insert audit log
    INSERT INTO audit_logs (
        timestamp,
        actor_user_id,
        actor_role,
        action_type,
        resource_type,
        resource_id,
        before_value,
        after_value,
        correlation_id,
        previous_log_hash,
        entry_hash,
        metadata
    ) VALUES (
        v_timestamp,
        p_actor_user_id,
        v_actor_role,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_before_value,
        p_after_value,
        COALESCE(p_correlation_id, uuid_generate_v4()),
        v_previous_hash,
        v_entry_hash,
        p_metadata
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to verify audit log integrity
CREATE OR REPLACE FUNCTION verify_audit_log_integrity(
    p_start_id BIGINT DEFAULT NULL,
    p_end_id BIGINT DEFAULT NULL
) RETURNS TABLE (
    log_id BIGINT,
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_log RECORD;
    v_calculated_hash VARCHAR(64);
    v_previous_hash VARCHAR(64);
BEGIN
    FOR v_log IN
        SELECT *
        FROM audit_logs
        WHERE (p_start_id IS NULL OR id >= p_start_id)
        AND (p_end_id IS NULL OR id <= p_end_id)
        ORDER BY id
    LOOP
        -- Get previous log hash
        IF v_log.id > 1 THEN
            SELECT entry_hash INTO v_previous_hash
            FROM audit_logs
            WHERE id = v_log.id - 1;
            
            -- Verify previous hash matches
            IF v_log.previous_log_hash != v_previous_hash THEN
                RETURN QUERY SELECT v_log.id, FALSE, 'Previous hash mismatch'::TEXT;
                CONTINUE;
            END IF;
        END IF;
        
        -- Calculate expected hash
        v_calculated_hash := calculate_audit_log_hash(
            v_log.timestamp,
            v_log.actor_user_id,
            v_log.action_type,
            v_log.resource_type,
            v_log.resource_id,
            v_log.before_value,
            v_log.after_value,
            v_log.previous_log_hash
        );
        
        -- Verify hash matches
        IF v_log.entry_hash = v_calculated_hash THEN
            RETURN QUERY SELECT v_log.id, TRUE, NULL::TEXT;
        ELSE
            RETURN QUERY SELECT v_log.id, FALSE, 'Hash verification failed'::TEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE audit_logs IS 'Append-only audit log with tamper-evident hash chain';
COMMENT ON COLUMN audit_logs.entry_hash IS 'SHA-256 hash of this entry for integrity verification';
COMMENT ON COLUMN audit_logs.previous_log_hash IS 'SHA-256 hash of previous entry for chain verification';
COMMENT ON COLUMN audit_logs.signature IS 'Cryptographic signature for non-repudiation';
COMMENT ON FUNCTION insert_audit_log IS 'Insert audit log entry with automatic hash chain calculation';
COMMENT ON FUNCTION verify_audit_log_integrity IS 'Verify integrity of audit log hash chain';
