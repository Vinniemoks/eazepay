#!/bin/bash
# Backup Verification Script
# This script verifies the integrity of database backups

set -e

# Configuration
BACKUP_FILE=$1
TEST_DB_NAME="backup_verify_$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}Usage: $0 <backup_file>${NC}"
    exit 1
fi

echo -e "${YELLOW}Verifying backup: ${BACKUP_FILE}${NC}"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Determine backup type
if [[ "$BACKUP_FILE" == *.sql.gz ]] || [[ "$BACKUP_FILE" == *.sql ]]; then
    # PostgreSQL backup
    echo -e "${YELLOW}Detected PostgreSQL backup${NC}"
    
    # Extract if compressed
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" > /tmp/backup_verify.sql
        RESTORE_FILE="/tmp/backup_verify.sql"
    else
        RESTORE_FILE="$BACKUP_FILE"
    fi
    
    # Create test database
    createdb $TEST_DB_NAME || echo -e "${YELLOW}Database may already exist${NC}"
    
    # Restore backup
    echo -e "${YELLOW}Restoring backup to test database...${NC}"
    psql $TEST_DB_NAME < $RESTORE_FILE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup restored successfully${NC}"
        
        # Verify data
        echo -e "${YELLOW}Verifying data integrity...${NC}"
        TABLE_COUNT=$(psql -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" $TEST_DB_NAME)
        echo -e "${GREEN}✅ Found ${TABLE_COUNT} tables${NC}"
        
        # Cleanup
        dropdb $TEST_DB_NAME
        rm -f /tmp/backup_verify.sql
        
        echo -e "${GREEN}✅ Backup verification successful${NC}"
        exit 0
    else
        echo -e "${RED}❌ Backup restoration failed${NC}"
        dropdb $TEST_DB_NAME || true
        rm -f /tmp/backup_verify.sql
        exit 1
    fi
    
elif [[ "$BACKUP_FILE" == *.tar.gz ]]; then
    # MongoDB backup
    echo -e "${YELLOW}Detected MongoDB backup${NC}"
    echo -e "${YELLOW}MongoDB backup verification requires MongoDB instance${NC}"
    echo -e "${YELLOW}Extracting backup to verify structure...${NC}"
    
    tar -tzf "$BACKUP_FILE" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup archive is valid${NC}"
        exit 0
    else
        echo -e "${RED}❌ Backup archive is corrupted${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Unknown backup format${NC}"
    exit 1
fi

