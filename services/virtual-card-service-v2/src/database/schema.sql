-- Virtual cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_number TEXT NOT NULL,
  cvv TEXT NOT NULL,
  expiry_month INTEGER NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INTEGER NOT NULL,
  cardholder_name VARCHAR(255) NOT NULL,
  card_type VARCHAR(20) DEFAULT 'mastercard' CHECK (card_type IN ('mastercard', 'visa')),
  balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'expired', 'cancelled')),
  billing_address JSONB NOT NULL,
  issuer_card_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

-- Card transactions table
CREATE TABLE IF NOT EXISTS card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  merchant_id VARCHAR(255),
  merchant_category VARCHAR(100),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL,
  original_amount DECIMAL(15,2),
  original_currency VARCHAR(3),
  exchange_rate DECIMAL(10,6),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'reversed')),
  decline_reason TEXT,
  authorization_code VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Card top-ups table
CREATE TABLE IF NOT EXISTS card_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  source_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  exchange_rate DECIMAL(10,6) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Card limits table (spending limits)
CREATE TABLE IF NOT EXISTS card_limits (
  card_id UUID PRIMARY KEY REFERENCES virtual_cards(id) ON DELETE CASCADE,
  daily_limit DECIMAL(15,2),
  monthly_limit DECIMAL(15,2),
  per_transaction_limit DECIMAL(15,2),
  daily_spent DECIMAL(15,2) DEFAULT 0.00,
  monthly_spent DECIMAL(15,2) DEFAULT 0.00,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON virtual_cards(status);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_issuer_id ON virtual_cards(issuer_card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_user_id ON card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_status ON card_transactions(status);
CREATE INDEX IF NOT EXISTS idx_card_transactions_created_at ON card_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_card_topups_card_id ON card_topups(card_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_virtual_cards_updated_at BEFORE UPDATE ON virtual_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_limits_updated_at BEFORE UPDATE ON card_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
