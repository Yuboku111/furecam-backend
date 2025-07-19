#!/bin/bash

# Wait for database
echo "Starting Medusa server..."

# Run migrations
yarn medusa db:migrate

# Start server
yarn start