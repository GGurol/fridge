from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUserDep
from app.core.models import UserPublic

router = APIRouter()


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUserDep) -> Any:
    return current_user
