#! /usr/bin/env bash

set -e
set -x

cd backend
poetry run python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json frontend/
cd frontend
npm run generate-client
npx prettier ./src/client --write
