-- Biometric templates table
CREATE TABLE IF NOT EXISTS biometric_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  biometric_type VARCHAR(20) NOT NULL CHECK (biometric_type IN ('fingerprint', 'palm', 'face')),
  finger_type VARCHAR(10) CHECK (finger_type IN ('thumb', 'index', 'middle', 'ring', 'pinky')),
  hand VARCHAR(5) CHECK (hand IN ('left', 'right')),
  template_data TEXT NOT NULL,
  template_hash VARCHAR(64) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(3,2),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  UNIQUE(user_id, biometric_type, finger_type, hand)
);

-- Biometric verification attempts
CREATE TABLE IF NOT EXISTS verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  transaction_id VARCHAR(255),
  match_score DECIMAL(3,2),
  success BOOLEAN,
  matched_template_id UUID REFERENCES biometric_templates(id),
  ip_address VARCHAR(45),
  device_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Duplicate detection cache (for fraud prevention)
CREATE TABLE IF NOT EXISTS biometric_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_hash VARCHAR(64) NOT NULL UNIQUE,
  biometric_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON biometric_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_hash ON biometric_templates(template_hash);
CREATE INDEX IF NOT EXISTS idx_templates_primary ON biometric_templates(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_transaction ON verification_attempts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_hashes_hash ON biometric_hashes(template_hash);
CREATE INDEX IF NOT EXISTS idx_hashes_user_id ON biometric_hashes(user_id);
