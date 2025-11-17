-- Agent profiles table
CREATE TABLE IF NOT EXISTS agent_profiles (
  agent_id UUID PRIMARY KEY,
  business_name VARCHAR(255),
  location VARCHAR(255),
  phone_number VARCHAR(15),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  commission_rate DECIMAL(5,2) DEFAULT 2.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent float (cash balance)
CREATE TABLE IF NOT EXISTS agent_float (
  agent_id UUID PRIMARY KEY,
  balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'KES',
  last_topup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent activities (customer registrations, transactions)
CREATE TABLE IF NOT EXISTS agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  customer_id UUID,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('registration', 'cash_in', 'cash_out', 'verification')),
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'KES',
  commission DECIMAL(15,2),
  reference VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent transactions (float management)
CREATE TABLE IF NOT EXISTS agent_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('topup', 'cash_in', 'cash_out', 'commission', 'fee')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  reference VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent statistics (cached for performance)
CREATE TABLE IF NOT EXISTS agent_statistics (
  agent_id UUID PRIMARY KEY,
  customers_registered INTEGER DEFAULT 0,
  cash_in_count INTEGER DEFAULT 0,
  cash_out_count INTEGER DEFAULT 0,
  total_volume DECIMAL(15,2) DEFAULT 0.00,
  today_volume DECIMAL(15,2) DEFAULT 0.00,
  this_week_volume DECIMAL(15,2) DEFAULT 0.00,
  this_month_volume DECIMAL(15,2) DEFAULT 0.00,
  total_commission DECIMAL(15,2) DEFAULT 0.00,
  last_activity_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_id ON agent_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_customer_id ON agent_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_created_at ON agent_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_agent_id ON agent_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_reference ON agent_transactions(reference);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_float_updated_at BEFORE UPDATE ON agent_float
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_statistics_updated_at BEFORE UPDATE ON agent_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
