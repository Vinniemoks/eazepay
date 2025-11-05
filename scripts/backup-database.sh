#!/bin/bash
# Database Backup Script for Eazepay
# This script creates automated backups of PostgreSQL and MongoDB databases

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting database backup process...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# PostgreSQL Backup
if [ ! -z "$POSTGRES_HOST" ]; then
    echo -e "${YELLOW}Backing up PostgreSQL database...${NC}"
    
    POSTGRES_BACKUP_FILE="${BACKUP_DIR}/postgres_backup_${DATE}.sql.gz"
    
    pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB \
        | gzip > $POSTGRES_BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL backup created: ${POSTGRES_BACKUP_FILE}${NC}"
        
        # Upload to S3 if configured
        if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
            echo -e "${YELLOW}Uploading to S3...${NC}"
            aws s3 cp $POSTGRES_BACKUP_FILE \
                s3://${AWS_S3_BACKUP_BUCKET}/postgres/${POSTGRES_BACKUP_FILE##*/}
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Uploaded to S3${NC}"
                # Remove local backup after successful upload
                rm $POSTGRES_BACKUP_FILE
            else
                echo -e "${RED}❌ Failed to upload to S3, keeping local backup${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ PostgreSQL backup failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  POSTGRES_HOST not set, skipping PostgreSQL backup${NC}"
fi

# MongoDB Backup
if [ ! -z "$MONGODB_HOST" ]; then
    echo -e "${YELLOW}Backing up MongoDB database...${NC}"
    
    MONGODB_BACKUP_DIR="${BACKUP_DIR}/mongodb_backup_${DATE}"
    MONGODB_BACKUP_FILE="${BACKUP_DIR}/mongodb_backup_${DATE}.tar.gz"
    
    mongodump --host $MONGODB_HOST \
        --port ${MONGODB_PORT:-27017} \
        --username $MONGODB_USER \
        --password $MONGODB_PASSWORD \
        --out $MONGODB_BACKUP_DIR
    
    if [ $? -eq 0 ]; then
        tar -czf $MONGODB_BACKUP_FILE $MONGODB_BACKUP_DIR
        rm -rf $MONGODB_BACKUP_DIR
        
        echo -e "${GREEN}✅ MongoDB backup created: ${MONGODB_BACKUP_FILE}${NC}"
        
        # Upload to S3 if configured
        if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
            echo -e "${YELLOW}Uploading to S3...${NC}"
            aws s3 cp $MONGODB_BACKUP_FILE \
                s3://${AWS_S3_BACKUP_BUCKET}/mongodb/${MONGODB_BACKUP_FILE##*/}
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Uploaded to S3${NC}"
                rm $MONGODB_BACKUP_FILE
            else
                echo -e "${RED}❌ Failed to upload to S3, keeping local backup${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ MongoDB backup failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  MONGODB_HOST not set, skipping MongoDB backup${NC}"
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up backups older than ${RETENTION_DAYS} days...${NC}"
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo -e "${GREEN}✅ Backup process completed successfully${NC}"

