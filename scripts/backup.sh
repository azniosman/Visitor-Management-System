#!/bin/bash
set -e

# Create backup directory if it doesn't exist
mkdir -p /backups

# Set backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/mongodb_backup_$TIMESTAMP.gz"

# Log start of backup
echo "Starting MongoDB backup at $(date)"

# Perform backup
mongodump --host=mongo --port=27017 --username=$MONGO_USERNAME --password=$MONGO_PASSWORD --authenticationDatabase=admin --db=$MONGO_DATABASE --archive=$BACKUP_FILE --gzip

# Log completion
echo "Backup completed at $(date)"
echo "Backup saved to $BACKUP_FILE"

# Clean up old backups (keep last 7 days)
find /backups -name "mongodb_backup_*.gz" -type f -mtime +7 -delete

# Sleep to keep container running (for cron scheduling)
if [ -n "$BACKUP_CRON_SCHEDULE" ]; then
  echo "Setting up cron schedule: $BACKUP_CRON_SCHEDULE"
  echo "$BACKUP_CRON_SCHEDULE /scripts/backup.sh" > /etc/crontabs/root
  crond -f
fi
