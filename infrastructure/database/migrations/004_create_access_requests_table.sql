-- Migration: Create access_requests table with approval workflow
-- Task: 1.4 - Create access_requests table with approval workflow
-- Requirements: 5.1, 5.2, 5.7, 17.1

-- Create request status and urgency enums
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE request_urgency AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create access_requests table
CREATE TABLE access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id),
    target_user_id UUID NOT NULL REFERENCES users(id),
    requested_permissions TEXT[] NOT NULL,
    justification TEXT NOT NULL,
    urgency request_urgency NOT NULL DEFAULT 'MEDIUM',
    status request_status NOT NULL DEFAULT 'PENDING',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Review details
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_reason TEXT,
    
    -- Constraints
    CONSTRAINT check_justification_length CHECK (LENGTH(justification) >= 50),
    CONSTRAINT check_requester_not_target CHECK (requester_id != target_user_id),
    CONSTRAINT check_reviewed_fields CHECK (
        (status = 'PENDING' AND reviewed_at IS NULL AND reviewed_by IS NULL) OR
        (status != 'PENDING' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_requester ON access_requests(requester_id);
CREATE INDEX idx_access_requests_target ON access_requests(target_user_id);
CREATE INDEX idx_access_requests_created ON access_requests(created_at DESC);
CREATE INDEX idx_access_requests_expires ON access_requests(expires_at) WHERE status = 'PENDING';
CREATE INDEX idx_access_requests_urgency ON access_requests(urgency) WHERE status = 'PENDING';

-- Create function to auto-expire requests
CREATE OR REPLACE FUNCTION expire_old_access_requests()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE access_requests
    SET status = 'EXPIRED'
    WHERE status = 'PENDING'
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate Segregation of Duties
CREATE OR REPLACE FUNCTION validate_sod_for_approval(
    p_request_id UUID,
    p_approver_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_requester_id UUID;
    v_target_user_id UUID;
    v_target_manager_id UUID;
BEGIN
    -- Get request details
    SELECT requester_id, target_user_id
    INTO v_requester_id, v_target_user_id
    FROM access_requests
    WHERE id = p_request_id;
    
    -- Get target user's manager
    SELECT manager_id
    INTO v_target_manager_id
    FROM users
    WHERE id = v_target_user_id;
    
    -- Check SoD violations
    -- 1. Approver cannot be the requester
    IF p_approver_id = v_requester_id THEN
        RETURN FALSE;
    END IF;
    
    -- 2. Approver cannot be the target user
    IF p_approver_id = v_target_user_id THEN
        RETURN FALSE;
    END IF;
    
    -- 3. If approver is target's direct manager, require second approval
    -- (This would need additional logic for two-person rule)
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE access_requests IS 'Access requests for permission changes with approval workflow';
COMMENT ON COLUMN access_requests.expires_at IS 'Auto-expires after 7 days if not reviewed';
COMMENT ON COLUMN access_requests.justification IS 'Business justification (minimum 50 characters)';
COMMENT ON FUNCTION expire_old_access_requests IS 'Auto-expire pending requests past expiry date';
COMMENT ON FUNCTION validate_sod_for_approval IS 'Validate Segregation of Duties rules for approval';
