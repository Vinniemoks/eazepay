-- Migration: Create transactions table with millisecond precision
-- Task: 1.5 - Create transactions table with millisecond precision
-- Requirements: 2.1, 9.1, 9.5, 24.1

-- Create transaction type and status enums
CREATE TYPE transaction_type AS ENUM (
    'DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 
    'REFUND', 'FEE', 'COMMISSION', 'REVERSAL'
);

CREATE TYPE transaction_status AS ENUM (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED'
);

-- Create transactions table with millisecond precision
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Timestamp with millisecond precision
    timestamp TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
    sequence_number BIGSERIAL NOT NULL,
    
    -- Transaction details
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    
    -- Parties involved
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    
    -- Status and fees
    status transaction_status NOT NULL DEFAULT 'PENDING',
    fees DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Additional data
    metadata JSONB,
    description TEXT,
    
    -- Idempotency
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    
    -- Audit
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_amount_positive CHECK (amount > 0),
    CONSTRAINT check_fees_non_negative CHECK (fees >= 0),
    CONSTRAINT check_parties CHECK (
        from_user_id IS NOT NULL OR to_user_id IS NOT NULL
    )
) PARTITION BY RANGE (timestamp);

-- Create partitions for current and future months
CREATE TABLE transactions_2025_01 PARTITION OF transactions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE transactions_2025_02 PARTITION OF transactions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE transactions_2025_03 PARTITION OF transactions
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Create indexes on parent table (will be inherited by partitions)
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id, timestamp DESC);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id, timestamp DESC);
CREATE INDEX idx_transactions_type ON transactions(type, timestamp DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_idempotency ON transactions(idempotency_key);
CREATE INDEX idx_transactions_sequence ON transactions(sequence_number);

-- Create GIN index for metadata JSONB queries
CREATE INDEX idx_transactions_metadata ON transactions USING GIN (metadata);

-- Create updated_at trigger
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get transaction with timezone conversion
CREATE OR REPLACE FUNCTION get_transaction_with_timezone(
    p_transaction_id UUID,
    p_timezone VARCHAR DEFAULT 'UTC'
) RETURNS TABLE (
    id UUID,
    timestamp_utc TIMESTAMPTZ,
    timestamp_local TIMESTAMPTZ,
    timezone VARCHAR,
    type transaction_type,
    amount DECIMAL,
    currency VARCHAR,
    status transaction_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.timestamp AS timestamp_utc,
        t.timestamp AT TIME ZONE p_timezone AS timestamp_local,
        p_timezone AS timezone,
        t.type,
        t.amount,
        t.currency,
        t.status
    FROM transactions t
    WHERE t.id = p_transaction_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to check idempotency
CREATE OR REPLACE FUNCTION check_idempotency_key(
    p_idempotency_key VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    SELECT id INTO v_transaction_id
    FROM transactions
    WHERE idempotency_key = p_idempotency_key;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE transactions IS 'Financial transactions with millisecond-precision timestamps';
COMMENT ON COLUMN transactions.timestamp IS 'Transaction timestamp with millisecond precision (TIMESTAMPTZ(3))';
COMMENT ON COLUMN transactions.sequence_number IS 'Sequence number for resolving millisecond-level collisions';
COMMENT ON COLUMN transactions.idempotency_key IS 'Unique key to prevent duplicate transactions';
COMMENT ON FUNCTION get_transaction_with_timezone IS 'Get transaction with timezone conversion';
COMMENT ON FUNCTION check_idempotency_key IS 'Check if idempotency key already exists';
