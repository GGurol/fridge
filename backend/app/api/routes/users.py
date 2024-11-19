from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import UserCreate, UserPublic

router = APIRouter()


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUserDep) -> Any:
    """
    Retrieves the current authenticated user's information.
    """

    return current_user


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    return crud.create_user(session=session, user_create=user_create)
