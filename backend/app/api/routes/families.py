from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import FamilyPublic

router = APIRouter()


@router.post("/", response_model=FamilyPublic)
def create_family(session: SessionDep, current_user: CurrentUserDep, name: str) -> Any:
    """
    Create new family.
    """

    family = crud.create_family(session=session, name=name, db_user=current_user)
    crud.promote_user_to_admin(session=session, db_user=current_user)
    return family


@router.post("/join", response_model=FamilyPublic)
def join_family(
    session: SessionDep, current_user: CurrentUserDep, invite_code: str
) -> Any:
    """
    Join a family.
    """

    family = crud.get_family_by_invite_code(session=session, invite_code=invite_code)
    crud.join_family(session=session, db_user=current_user, family_id=family.id)
    return family
