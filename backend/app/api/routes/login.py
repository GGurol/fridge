from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUserDep
from app.config import settings
from app.core import crud, security
from app.core.models import Token, User

router = APIRouter()


@router.post("/login/access-token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = crud.authenticate(email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )


@router.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: CurrentUserDep,
):
    return current_user


@router.get("/users/me/items/")
async def read_own_items(
    current_user: CurrentUserDep,
):
    return [{"item_id": "Foo", "owner": current_user.username}]
