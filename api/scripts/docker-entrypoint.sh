#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 2

echo "Running Prisma migrations..."
npx prisma db push --skip-generate

echo "Starting the application..."
exec node dist/index.js
