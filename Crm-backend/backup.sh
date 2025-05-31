#!/bin/bash

# Backup script for CRM database
# Usage: ./backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="crm_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Creating database backup..."

# Create backup using docker-compose
docker-compose exec -T mysql mysqldump \
  -u crm_user \
  -pcrm_password \
  --single-transaction \
  --routines \
  --triggers \
  crm_db > "${BACKUP_DIR}/${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: ${BACKUP_DIR}/${BACKUP_FILE}"
    
    # Compress the backup
    gzip "${BACKUP_DIR}/${BACKUP_FILE}"
    echo "Backup compressed: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
    
    # Clean up old backups (keep last 7 days)
    find $BACKUP_DIR -name "crm_backup_*.sql.gz" -mtime +7 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi
