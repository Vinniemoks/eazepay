#!/bin/bash
# Script to run all database migrations
# Usage: ./run-migrations.sh

set -e

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_NAME=${DB_NAME:-afripay_dev}
DB_USER=${DB_USER:-developer}

echo "🚀 Running AfriPay Database Migrations..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Check if PostgreSQL is accessible
if ! PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
    echo "❌ Cannot connect to PostgreSQL. Please check your connection settings."
    exit 1
fi

echo "✅ PostgreSQL connection successful"
echo ""

# Run migrations in order
MIGRATIONS=(
    "001_create_users_table.sql"
    "002_create_permission_codes_table.sql"
    "003_create_user_permissions_table.sql"
    "004_create_access_requests_table.sql"
    "005_create_transactions_table.sql"
    "006_create_audit_logs_table.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    echo "📝 Running migration: $migration"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "infrastructure/database/migrations/$migration"
    
    if [ $? -eq 0 ]; then
        echo "✅ $migration completed successfully"
    else
        echo "❌ $migration failed"
        exit 1
    fi
    echo ""
done

echo "🎉 All migrations completed successfully!"
echo ""
echo "Database schema is ready. You can now:"
echo "  1. Start the identity service: cd services/identity-service && npm run dev"
echo "  2. Create your first superuser via API"
echo "  3. Access the admin portal"
