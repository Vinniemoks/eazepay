-- Migration: Create users table with role hierarchy
-- Task: 1.1 - Create users table with role hierarchy
-- Requirements: 3.2, 3.3, 3.4

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('SUPERUSER', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'AGENT');
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'REJECTED');
CREATE TYPE department_type AS ENUM ('FINANCE', 'OPERATIONS', 'CUSTOMER_SUPPORT', 'COMPLIANCE', 'IT', 'MANAGEMENT');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    
    -- Role and hierarchy
    role user_role NOT NULL,
    department department_type,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status and verification
    status user_status NOT NULL DEFAULT 'PENDING',
    government_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- 2FA settings
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_method VARCHAR(20),
    two_factor_secret VARCHAR(255),
    
    -- Biometric
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    biometric_template_id TEXT,
    
    -- Verification details
    verification_type VARCHAR(50),
    verification_number VARCHAR(100),
    verification_documents JSONB,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Business details (for agents)
    business_details JSONB,
    
    -- Security
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_superuser_limit CHECK (
        role != 'SUPERUSER' OR 
        (SELECT COUNT(*) FROM users WHERE role = 'SUPERUSER') < 2
    )
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE users IS 'Main users table with role hierarchy and organizational structure';
COMMENT ON COLUMN users.role IS 'User role: SUPERUSER (max 2), ADMIN, MANAGER, EMPLOYEE, CUSTOMER, AGENT';
COMMENT ON COLUMN users.department IS 'Department for organizational hierarchy';
COMMENT ON COLUMN users.manager_id IS 'Reference to manager for hierarchical reporting';
COMMENT ON CONSTRAINT check_superuser_limit ON users IS 'Enforces maximum of 2 superusers';
