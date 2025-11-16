#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE eazepay_users;
    CREATE DATABASE eazepay_wallets;
EOSQL

echo "✅ Databases created successfully"
