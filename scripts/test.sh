#! /usr/bin/env sh

# Exit in case of error
set -e
set -x

# Start the dev db and setup with initial data
./scripts/start-dev-db.sh

# Run backend tests
cd backend
./scripts/test.sh
cd ..

# Run frontend tests
cd frontend
npm run test
cd ..

# Cleanup after tests
docker compose -f docker-compose.dev-db.yml down -v --remove-orphans # Remove possibly previous broken stacks left hanging after an error
