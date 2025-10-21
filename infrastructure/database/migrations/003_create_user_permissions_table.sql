-- Migration: Create user_permissions junction table
-- Task: 1.3 - Create user_permissions junction table
-- Requirements: 4.3, 4.6

-- Create user_permissions table
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_code VARCHAR(100) NOT NULL REFERENCES permission_codes(code),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ,
    notes TEXT,
    
    -- Ensure unique user-permission combination
    UNIQUE(user_id, permission_code)
);

-- Create indexes
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_code ON user_permissions(permission_code);
CREATE INDEX idx_user_permissions_granted_by ON user_permissions(granted_by);
CREATE INDEX idx_user_permissions_expires ON user_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to check permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_code VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_permissions up
        JOIN permission_codes pc ON up.permission_code = pc.code
        WHERE up.user_id = p_user_id
        AND up.permission_code = p_permission_code
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
        AND pc.deprecated = FALSE
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
    permission_code VARCHAR,
    description TEXT,
    department department_type,
    resource VARCHAR,
    action permission_action,
    granted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.code,
        pc.description,
        pc.department,
        pc.resource,
        pc.action,
        up.granted_at,
        up.expires_at
    FROM user_permissions up
    JOIN permission_codes pc ON up.permission_code = pc.code
    WHERE up.user_id = p_user_id
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
    AND pc.deprecated = FALSE
    ORDER BY pc.department, pc.resource, pc.action;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE user_permissions IS 'Junction table linking users to their granted permissions';
COMMENT ON COLUMN user_permissions.granted_by IS 'User who granted this permission';
COMMENT ON COLUMN user_permissions.expires_at IS 'Optional expiration date for temporary permissions';
COMMENT ON FUNCTION user_has_permission IS 'Check if user has a specific permission';
COMMENT ON FUNCTION get_user_permissions IS 'Get all active permissions for a user';
