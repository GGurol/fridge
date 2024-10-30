from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.config import settings
from app.core import crud, security
from app.core.models import TokenPayload, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_STR}/login/access-token")

TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(token: TokenDep):
    print(token)
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        print(payload)
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    print(token_data)
    user_id = token_data.sub
    user = crud.get_user_by_id(user_id=user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def get_current_admin(
    current_user: CurrentUserDep,
):
    if current_user.is_admin:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
