#! /usr/bin/env bash

set -e
set -x

# Check the DB
python app/check_db_connection.py

# Run migrations
alembic upgrade head

# Create initial data in DB
python app/init_db.py
