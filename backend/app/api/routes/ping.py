"""Provides a simple health check endpoint that returns 'PONG'."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def ping():
    return "PONG"
