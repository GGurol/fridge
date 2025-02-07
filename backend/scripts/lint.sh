#!/usr/bin/env bash

set -e
set -x

poetry run ruff check app --fix