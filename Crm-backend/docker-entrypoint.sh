#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."

# Function to check MySQL connection
wait_for_mysql() {
    local attempt=0
    local max_attempts=30
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        echo "MySQL connection attempt $attempt/$max_attempts"
        
        # Check if MySQL port is open and responding
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            echo "MySQL port is open, checking if ready..."
            # Give MySQL a moment to fully initialize after port opens
            sleep 2
            echo "MySQL is ready!"
            return 0
        fi
        
        echo "MySQL is unavailable (attempt $attempt/$max_attempts) - sleeping for 3s"
        sleep 3
    done
    
    echo "MySQL did not become available after $max_attempts attempts. Exiting."
    exit 1
}

# Wait for MySQL to be ready
wait_for_mysql

echo "MySQL is up - executing migrations"

# Run migrations
npm run migrate

# Start the application
exec npm start
