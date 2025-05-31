#!/bin/bash

# Restore script for CRM database
# Usage: ./restore.sh <backup_file.sql.gz>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./backups/crm_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will replace all data in the database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 1
fi

echo "Stopping backend service..."
docker-compose stop backend

echo "Restoring database from: $BACKUP_FILE"

# Decompress and restore
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker-compose exec -T mysql mysql -u crm_user -pcrm_password crm_db
else
    docker-compose exec -T mysql mysql -u crm_user -pcrm_password crm_db < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "Database restored successfully"
    echo "Starting backend service..."
    docker-compose start backend
else
    echo "Restore failed!"
    exit 1
fi
