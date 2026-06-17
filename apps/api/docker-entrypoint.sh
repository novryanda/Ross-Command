#!/bin/sh
set -e

if [ "${RUN_MIGRATE_ON_STARTUP:-true}" = "true" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
else
  echo "Skipping database migrations (RUN_MIGRATE_ON_STARTUP=false)."
fi

echo "Starting API server..."
exec node dist/src/main.js
