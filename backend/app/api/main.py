from fastapi import APIRouter

from app.api.routes import login, ping

api_router = APIRouter()
api_router.include_router(ping.router, prefix="/ping", tags=["ping"])
api_router.include_router(login.router, tags=["login"])
