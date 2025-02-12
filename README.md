# fridge
description for fridge
## Technology Stack and Features

- ⚡ [**FastAPI**](https://fastapi.tiangolo.com) for the Python backend API.
    - 🧰 [SQLModel](https://sqlmodel.tiangolo.com) for the Python SQL database interactions (ORM).
    - 🔍 [Pydantic](https://docs.pydantic.dev), used by FastAPI, for the data validation and settings management.
    - 💾 [PostgreSQL](https://www.postgresql.org) as the SQL database.
- 🚀 [React](https://react.dev) for the frontend.
    - 💃 Using TypeScript, hooks, Vite, and other parts of a modern frontend stack.
    - 🎨 [Chakra UI](https://chakra-ui.com) for the frontend components.
    - 🤖 An automatically generated frontend client.
    - 🧪 [Playwright](https://playwright.dev) for End-to-End testing.
    - 🦇 Dark mode support.
- 🐋 [Docker Compose](https://www.docker.com) for development and production.
- 🔒 Secure password hashing by default.
- 🔑 JWT (JSON Web Token) authentication.
- 📫 Email based password recovery.
- ✅ Tests with [Pytest](https://pytest.org).
- 📞 [Traefik](https://traefik.io) as a reverse proxy / load balancer.
- 🚢 Deployment instructions using Docker Compose, including how to set up a frontend Traefik proxy to handle automatic HTTPS certificates.
- 🏭 CI (continuous integration) and CD (continuous deployment) based on GitHub Actions.

### Login

[![API docs](img/login.png)](https://github.com/david-miklos/fridge)

### Sign Up

[![API docs](img/sign-up.png)](https://github.com/david-miklos/fridge)

### Setup

[![API docs](img/setup.png)](https://github.com/david-miklos/fridge)

### Home

[![API docs](img/home.png)](https://github.com/david-miklos/fridge)

### Add List

[![API docs](img/add-list.png)](https://github.com/david-miklos/fridge)

### Edit List

[![API docs](img/edit-list.png)](https://github.com/david-miklos/fridge)

### Add Task

[![API docs](img/add-task.png)](https://github.com/david-miklos/fridge)

### Tasks

[![API docs](img/tasks.png)](https://github.com/david-miklos/fridge)

### Interactive API Documentation

[![API docs](img/docs.png)](https://github.com/david-miklos/fridge)

## User Roles

**1. Family Admin**
- Can create a family.
- Can create and edit  a family list.
- Can promote a member to admin.
- Can assign tasks to specific members.

**2. Family Member**
- Can join a family.
- Can create and edit a personal list.
- Can create / complete / clear personal tasks.

## How to use

### Requirements

* [Docker](https://www.docker.com/).

To spin up the stack run:

```bash
docker compose up -d --build
```

Frontend: http://localhost

Backend API docs: http://localhost:8000/docs

Backend API base URL: http://localhost:8000/api -> http://localhost:8000/api/ping/ for health check

## Development

For dev

# Start the dev db
docker compose -f docker-compose.dev-db.yml down -v --remove-orphans # Remove possibly previous broken stacks left hanging after an error
docker compose -f docker-compose.dev-db.yml build
docker compose -f docker-compose.dev-db.yml up -d

## Backend Development

## Requirements

* [Docker](https://www.docker.com/).
* [Poetry](https://python-poetry.org/) for Python package and environment management.

Install the dependencies

```bash
poetry install
```

Run the development server

```bash
poetry run fastapi dev app/main.py
```


Backend docs: [backend/README.md](./backend/README.md).

## Frontend Development

Frontend docs: [frontend/README.md](./frontend/README.md).

## Deployment

Deployment docs: [deployment.md](./deployment.md).

## Development

General development docs: [development.md](./development.md).

This includes using Docker Compose, custom local domains, `.env` configurations, etc.
