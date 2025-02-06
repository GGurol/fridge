import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.config import settings
from app.core import crud
from app.core.models import FamilyPublic, ListCreate, UsersPublic

router = APIRouter()


@router.post("/", response_model=FamilyPublic)
def create_family(session: SessionDep, current_user: CurrentUserDep, name: str) -> Any:
    """
    Create new family.
    """

    if current_user.family_id:
        raise HTTPException(status_code=403, detail="User is already part of a family")

    family = crud.create_family(session=session, name=name)
    crud.join_family(session=session, db_user=current_user, family_id=family.id)
    crud.promote_user_to_admin(session=session, db_user=current_user)

    crud.create_list(
        session=session,
        list_in=ListCreate(name=settings.DEFAULT_FAMILY_LIST, is_family_list=True),
        relationship_data={"family_id": current_user.family_id},
    )
    crud.create_list(
        session=session,
        list_in=ListCreate(name=settings.DEFAULT_PERSONAL_LIST),
        relationship_data={"user_id": current_user.id},
    )

    return family


@router.post("/join", response_model=FamilyPublic)
def join_family(
    session: SessionDep, current_user: CurrentUserDep, invite_code: str
) -> Any:
    """
    Join a family.
    """
    if current_user.family_id:
        raise HTTPException(status_code=403, detail="User is already part of a family")

    family = crud.read_family_by_invite_code(session=session, invite_code=invite_code)
    crud.join_family(session=session, db_user=current_user, family_id=family.id)

    crud.create_list(
        session=session,
        list_in=ListCreate(name=settings.DEFAULT_PERSONAL_LIST),
        relationship_data={"user_id": current_user.id},
    )

    return family


@router.get(
    "/{family_id}/members",
    response_model=UsersPublic,
)
def read_family_members(
    session: SessionDep, current_user: CurrentUserDep, family_id: uuid.UUID
) -> Any:
    """
    Reads family members.
    """
    if family_id != current_user.family_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to access another family's members.",
        )

    return crud.read_family_members(session=session, family_id=family_id)


@router.get("/{family_id}/invite-code", response_model=str)
def read_family_invite_code(
    session: SessionDep, current_user: CurrentUserDep, family_id: uuid.UUID
) -> Any:
    """
    Reads family invite code.
    """
    if family_id != current_user.family_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to access another family's invite code.",
        )

    family = crud.read_family_by_id(session=session, id=family_id)
    return family.invite_code
