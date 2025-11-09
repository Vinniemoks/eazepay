-- Initial schema for backend services
-- Users table for identity-service
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for transaction-service
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  receiver VARCHAR(255) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);