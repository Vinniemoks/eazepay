-- Eazepay Universal Database Initialization Script
-- This script sets up the initial database schema and data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS biometric;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS wallets;
CREATE SCHEMA IF NOT EXISTS agents;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set search path
SET search_path TO public, identity, biometric, transactions, wallets, agents, audit;

-- ================================
-- IDENTITY SCHEMA
-- ================================

-- Users table (main table from Identity Service)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    national_id VARCHAR(50),
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    kyc_status VARCHAR(20) DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    account_tier VARCHAR(20) DEFAULT 'BASIC' CHECK (account_tier IN ('BASIC', 'STANDARD', 'PREMIUM')),
    auth_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles extended information
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    county VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'KE',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User sessions for JWT token management
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_id VARCHAR(255),
    device_type VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- BIOMETRIC SCHEMA
-- ================================

-- Biometric templates (from Biometric Service)
CREATE TABLE IF NOT EXISTS biometric_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('FINGERPRINT', 'FACE', 'VOICE')),
    template_data TEXT NOT NULL, -- Base64 encoded encrypted template
    quality DECIMAL(3,2) NOT NULL CHECK (quality >= 0 AND quality <= 1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, template_type)
);

-- Biometric authentication attempts
CREATE TABLE IF NOT EXISTS biometric_auth_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    template_type VARCHAR(20) NOT NULL,
    success BOOLEAN NOT NULL,
    confidence_score DECIMAL(4,3),
    device_id VARCHAR(255),
    ip_address INET,
    attempt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failure_reason TEXT
);

-- ================================
-- TRANSACTIONS SCHEMA
-- ================================

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_type VARCHAR(20) DEFAULT 'MAIN' CHECK (wallet_type IN ('MAIN', 'SAVINGS', 'BUSINESS')),
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    available_balance DECIMAL(15,2) DEFAULT 0.00 CHECK (available_balance >= 0),
    daily_limit DECIMAL(15,2) DEFAULT 50000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 1000000.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallet_type)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_ref VARCHAR(50) UNIQUE NOT NULL,
    from_wallet_id UUID REFERENCES wallets(wallet_id),
    to_wallet_id UUID REFERENCES wallets(wallet_id),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('P2P', 'CASH_IN', 'CASH_OUT', 'BILL_PAYMENT', 'AIRTIME', 'MERCHANT_PAYMENT')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED')),
    description TEXT,
    metadata JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either from or to wallet exists (for cash in/out transactions)
    CONSTRAINT check_wallet_exists CHECK (from_wallet_id IS NOT NULL OR to_wallet_id IS NOT NULL)
);

-- Transaction fees configuration
CREATE TABLE IF NOT EXISTS transaction_fees (
    fee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(30) NOT NULL,
    amount_min DECIMAL(15,2) NOT NULL,
    amount_max DECIMAL(15,2),
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('FIXED', 'PERCENTAGE')),
    fee_value DECIMAL(10,4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- AGENTS SCHEMA
-- ================================

-- Agent information
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    agent_code VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(50),
    license_number VARCHAR(100),
    location POINT, -- PostGIS point for geographic location
    address TEXT,
    county VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    daily_limit DECIMAL(15,2) DEFAULT 200000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 5000000.00,
    commission_rate DECIMAL(5,4) DEFAULT 0.005, -- 0.5%
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Agent terminals (hardware devices)
CREATE TABLE IF NOT EXISTS agent_terminals (
    terminal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(100),
    firmware_version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SUSPENDED')),
    last_ping TIMESTAMP,
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    location POINT,
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent transactions
CREATE TABLE IF NOT EXISTS agent_transactions (
    agent_transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(transaction_id),
    agent_id UUID NOT NULL REFERENCES agents(agent_id),
    terminal_id UUID REFERENCES agent_terminals(terminal_id),
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- AUDIT SCHEMA
-- ================================

-- Audit trail for all critical operations
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    service_name VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System events log
CREATE TABLE IF NOT EXISTS system_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO' CHECK (severity IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL')),
    message TEXT NOT NULL,
    metadata JSONB,
    service_name VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Biometric indexes
CREATE INDEX IF NOT EXISTS idx_biometric_templates_user_id ON biometric_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_type ON biometric_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_biometric_auth_attempts_user_id ON biometric_auth_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_auth_attempts_timestamp ON biometric_auth_attempts(attempt_timestamp);

-- Wallets indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_type ON wallets(wallet_type);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_ref ON transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet ON transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_processed_at ON transactions(processed_at);

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_code ON agents(agent_code);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_terminals_serial ON agent_terminals(serial_number);
CREATE INDEX IF NOT EXISTS idx_agent_terminals_agent_id ON agent_terminals(agent_id);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_system_events_timestamp ON system_events(timestamp);

-- ================================
-- INITIAL DATA
-- ================================

-- Insert default transaction fees
INSERT INTO transaction_fees (transaction_type, amount_min, amount_max, fee_type, fee_value) VALUES
('P2P', 1.00, 999.99, 'FIXED', 0.00), -- Free for small amounts
('P2P', 1000.00, 9999.99, 'FIXED', 5.00),
('P2P', 10000.00, NULL, 'PERCENTAGE', 0.005),
('CASH_IN', 1.00, 999.99, 'FIXED', 0.00),
('CASH_IN', 1000.00, NULL, 'FIXED', 10.00),
('CASH_OUT', 1.00, NULL, 'PERCENTAGE', 0.01),
('BILL_PAYMENT', 1.00, NULL, 'FIXED', 15.00),
('AIRTIME', 1.00, NULL, 'FIXED', 0.00),
('MERCHANT_PAYMENT', 1.00, NULL, 'PERCENTAGE', 0.003)
ON CONFLICT DO NOTHING;

-- Insert system event for database initialization
INSERT INTO system_events (event_type, severity, message, service_name) VALUES
('DATABASE_INIT', 'INFO', 'Eazepay Universal database initialized successfully', 'postgres-init')
ON CONFLICT DO NOTHING;

-- ================================
-- FUNCTIONS AND TRIGGERS
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_biometric_templates_updated_at BEFORE UPDATE ON biometric_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_terminals_updated_at BEFORE UPDATE ON agent_terminals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate transaction reference
CREATE OR REPLACE FUNCTION generate_transaction_ref()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_ref IS NULL THEN
        NEW.transaction_ref := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('transaction_ref_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for transaction references
CREATE SEQUENCE IF NOT EXISTS transaction_ref_seq START 1;

-- Apply transaction reference trigger
CREATE TRIGGER generate_transaction_ref_trigger BEFORE INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION generate_transaction_ref();

-- Function to create default wallet for new users
CREATE OR REPLACE FUNCTION create_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, wallet_type, balance, available_balance)
    VALUES (NEW.user_id, 'MAIN', 0.00, 0.00);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply wallet creation trigger
CREATE TRIGGER create_default_wallet_trigger AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION create_default_wallet();

-- ================================
-- PERMISSIONS
-- ================================

-- Grant permissions to the developer user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO developer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO developer;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO developer;

-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'analytics_readonly_2024!';
GRANT CONNECT ON DATABASE eazepay_dev TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

COMMIT;