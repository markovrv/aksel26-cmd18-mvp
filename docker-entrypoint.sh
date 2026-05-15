#!/bin/sh
set -e

echo "=== Заводыч Docker Entrypoint ==="

# Create data directory for SQLite database
mkdir -p /app/data

# Run database seed (idempotent - clears and re-seeds with demo data)
echo "Running database seed..."
cd /app/server && node db/seed.js

echo "Starting server..."
exec node index.js