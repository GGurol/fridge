FROM python:3.12

WORKDIR /workspace/

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

COPY ./scripts /workspace/scripts
COPY ./tests /workspace/tests
COPY ./alembic /workspace/alembic
COPY ./alembic.ini /workspace/

# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./pyproject.toml ./poetry.lock* /workspace/

RUN poetry install --no-root

ENV PYTHONPATH=/workspace

COPY ./app /workspace/app

CMD ["fastapi", "run", "app/main.py", "--port", "8000"]
