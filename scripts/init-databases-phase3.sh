#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE eazepay_users;
    CREATE DATABASE eazepay_wallets;
    CREATE DATABASE eazepay_biometrics;
    CREATE DATABASE eazepay_agents;
    CREATE DATABASE eazepay_cards;
EOSQL

echo "✅ Phase 3 databases created successfully"
