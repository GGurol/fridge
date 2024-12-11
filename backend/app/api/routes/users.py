import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentAdminDep, CurrentUserDep, SessionDep, get_current_admin
from app.core import crud
from app.core.models import Message, UserCreate, UserPublic, UsersPublic

router = APIRouter()


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUserDep) -> Any:
    """
    Retrieves the current authenticated user's information.
    """

    return current_user


@router.get(
    "/{family_id}",
    dependencies=[Depends(get_current_admin)],
    response_model=UsersPublic,
)
def read_family_members(session: SessionDep, family_id: uuid.UUID) -> Any:
    """
    Reads family members.
    """

    return crud.read_family_members(session=session, family_id=family_id)


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserCreate) -> Any:
    """

    Create new user without the need to be logged in.
    """
    user = crud.read_user_by_email(session=session, email=user_in.email)

    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )

    user_create = UserCreate.model_validate(user_in)

    return crud.create_user(session=session, user_create=user_create)


@router.post("/promote/{user_id}", response_model=Message)
def promote_user(
    session: SessionDep, current_admin: CurrentAdminDep, user_id: uuid.UUID
) -> Any:
    db_user = crud.read_user_by_id(session=session, id=user_id)

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    crud.promote_user_to_admin(session=session, db_user=db_user)

    crud.demote_admin_to_user(session=session, db_admin_user=current_admin)

    return Message(message="User promoted to admin successfully")
