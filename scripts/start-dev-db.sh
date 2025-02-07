#! /usr/bin/env bash

set -e
set -x

# Start the dev db
docker compose -f docker-compose.dev-db.yml build
docker compose -f docker-compose.dev-db.yml down -v --remove-orphans # Remove possibly previous broken stacks left hanging after an error
docker compose -f docker-compose.dev-db.yml up -d

# Setup the db by running migrations and creating initial data
cd backend
./scripts/setup-db.sh

