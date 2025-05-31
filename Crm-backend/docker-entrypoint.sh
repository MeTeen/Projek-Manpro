#!/bin/sh
set -e

echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."

# Function to check PostgreSQL connection
wait_for_postgres() {
    local attempt=0
    local max_attempts=30
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        echo "PostgreSQL connection attempt $attempt/$max_attempts"
        
        # Check if PostgreSQL port is open and responding
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            echo "PostgreSQL port is open, checking if ready..."
            # Give PostgreSQL a moment to fully initialize after port opens
            sleep 2
            echo "PostgreSQL is ready!"
            return 0
        fi
        
        echo "PostgreSQL is unavailable (attempt $attempt/$max_attempts) - sleeping for 3s"
        sleep 3
    done
    
    echo "PostgreSQL did not become available after $max_attempts attempts. Exiting."
    exit 1
}

# Wait for PostgreSQL to be ready
wait_for_postgres

echo "PostgreSQL is up - executing migrations"

# Run migrations
npm run migrate

# Start the application
exec npm start
