#! /usr/bin/env bash

set -e
set -x

# Check the DB
poetry run python app/check_db_connection.py

# Run migrations
poetry run alembic upgrade head

# Create initial data in DB
poetry run python app/init_db.py