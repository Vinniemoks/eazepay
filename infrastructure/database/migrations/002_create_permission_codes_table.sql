-- Migration: Create permission_codes table with versioning
-- Task: 1.2 - Create permission_codes table with versioning
-- Requirements: 4.1, 4.2, 4.5

-- Create permission action enum
CREATE TYPE permission_action AS ENUM ('VIEW', 'EDIT', 'CREATE', 'DELETE', 'APPROVE', 'EXPORT');

-- Create permission_codes table
CREATE TABLE permission_codes (
    code VARCHAR(100) PRIMARY KEY,
    description TEXT NOT NULL,
    department department_type NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action permission_action NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    deprecated BOOLEAN NOT NULL DEFAULT FALSE,
    replacement_code VARCHAR(100) REFERENCES permission_codes(code),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deprecated_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT check_code_format CHECK (code ~ '^[A-Z]+-[A-Z_]+-[A-Z]+$'),
    CONSTRAINT check_version_format CHECK (version ~ '^\d+\.\d+\.\d+$'),
    CONSTRAINT check_deprecated_replacement CHECK (
        NOT deprecated OR replacement_code IS NOT NULL
    )
);

-- Create indexes
CREATE INDEX idx_permission_codes_dept ON permission_codes(department);
CREATE INDEX idx_permission_codes_deprecated ON permission_codes(deprecated);
CREATE INDEX idx_permission_codes_resource ON permission_codes(resource);
CREATE INDEX idx_permission_codes_action ON permission_codes(action);

-- Insert default permission codes
INSERT INTO permission_codes (code, description, department, resource, action, version) VALUES
    -- Finance Department
    ('FIN-REPORTS-VIEW', 'View financial reports', 'FINANCE', 'REPORTS', 'VIEW', '1.0.0'),
    ('FIN-REPORTS-EXPORT', 'Export financial reports', 'FINANCE', 'REPORTS', 'EXPORT', '1.0.0'),
    ('FIN-TRANSACTIONS-VIEW', 'View all transactions', 'FINANCE', 'TRANSACTIONS', 'VIEW', '1.0.0'),
    ('FIN-TRANSACTIONS-EDIT', 'Edit transaction details', 'FINANCE', 'TRANSACTIONS', 'EDIT', '1.0.0'),
    ('FIN-ANALYTICS-VIEW', 'View financial analytics', 'FINANCE', 'ANALYTICS', 'VIEW', '1.0.0'),
    
    -- Operations Department
    ('OPS-USERS-VIEW', 'View user information', 'OPERATIONS', 'USERS', 'VIEW', '1.0.0'),
    ('OPS-USERS-EDIT', 'Edit user information', 'OPERATIONS', 'USERS', 'EDIT', '1.0.0'),
    ('OPS-USERS-CREATE', 'Create new users', 'OPERATIONS', 'USERS', 'CREATE', '1.0.0'),
    ('OPS-USERS-DELETE', 'Delete users', 'OPERATIONS', 'USERS', 'DELETE', '1.0.0'),
    ('OPS-REQUESTS-VIEW', 'View access requests', 'OPERATIONS', 'REQUESTS', 'VIEW', '1.0.0'),
    ('OPS-REQUESTS-APPROVE', 'Approve access requests', 'OPERATIONS', 'REQUESTS', 'APPROVE', '1.0.0'),
    
    -- Customer Support Department
    ('SUP-TICKETS-VIEW', 'View support tickets', 'CUSTOMER_SUPPORT', 'TICKETS', 'VIEW', '1.0.0'),
    ('SUP-TICKETS-EDIT', 'Edit support tickets', 'CUSTOMER_SUPPORT', 'TICKETS', 'EDIT', '1.0.0'),
    ('SUP-CUSTOMERS-VIEW', 'View customer information', 'CUSTOMER_SUPPORT', 'CUSTOMERS', 'VIEW', '1.0.0'),
    
    -- Compliance Department
    ('COM-AUDIT-VIEW', 'View audit logs', 'COMPLIANCE', 'AUDIT', 'VIEW', '1.0.0'),
    ('COM-AUDIT-EXPORT', 'Export audit logs', 'COMPLIANCE', 'AUDIT', 'EXPORT', '1.0.0'),
    ('COM-VERIFICATION-VIEW', 'View verification requests', 'COMPLIANCE', 'VERIFICATION', 'VIEW', '1.0.0'),
    ('COM-VERIFICATION-APPROVE', 'Approve verification requests', 'COMPLIANCE', 'VERIFICATION', 'APPROVE', '1.0.0'),
    
    -- IT Department
    ('IT-SYSTEM-VIEW', 'View system configuration', 'IT', 'SYSTEM', 'VIEW', '1.0.0'),
    ('IT-SYSTEM-EDIT', 'Edit system configuration', 'IT', 'SYSTEM', 'EDIT', '1.0.0'),
    ('IT-PERMISSIONS-VIEW', 'View permission codes', 'IT', 'PERMISSIONS', 'VIEW', '1.0.0'),
    ('IT-PERMISSIONS-CREATE', 'Create permission codes', 'IT', 'PERMISSIONS', 'CREATE', '1.0.0');

-- Add comments
COMMENT ON TABLE permission_codes IS 'Registry of all permission codes with versioning support';
COMMENT ON COLUMN permission_codes.code IS 'Permission code in format: DEPT-RESOURCE-ACTION';
COMMENT ON COLUMN permission_codes.deprecated IS 'Whether this permission code is deprecated';
COMMENT ON COLUMN permission_codes.replacement_code IS 'Replacement code if deprecated';
