import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import List, ListCreate, ListPublic, ListUpdate, Message

router = APIRouter()


@router.post("/", response_model=ListPublic)
def create_list(
    session: SessionDep, current_user: CurrentUserDep, list_in: ListCreate
) -> Any:
    """
    Create new list.
    """

    if list_in.is_family_list:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to create a family list.",
            )
        return crud.create_list(
            session=session,
            list_in=list_in,
            relationship_data={"family_id": current_user.family_id},
        )

    return crud.create_list(
        session=session, list_in=list_in, relationship_data={"user_id": current_user.id}
    )


@router.patch("/{list_id}", response_model=ListPublic)
def update_list(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
    list_in: ListUpdate,
) -> Any:
    """
    Update a list.
    """

    db_list = crud.get_list_by_id(session=session, id=list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")

    if db_list.family_id:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to update a family list.",
            )

        if db_list.family_id != current_user.family_id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to update someone else's family list.",
            )

        return crud.update_list(session=session, db_list=db_list, list_in=list_in)

    if db_list.user_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Not enough permissions to update someone else's the list.",
        )

    return crud.update_list(session=session, db_list=db_list, list_in=list_in)


@router.delete("/{id}", response_model=Message)
def delete_list(session: SessionDep, current_user, id: uuid.UUID) -> Any:
    """
    Delete list
    """

    db_list = session.get(List, id)

    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")

    if db_list.family_id:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to delete a family list.",
            )

        if db_list.family_id != current_user.family_id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to delete someone else's family list.",
            )

        crud.delete_list(session=session, db_list=db_list)
        return Message(message="Task deleted successfully")

    if db_list.user_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Not enough permissions to delete someone else's the list.",
        )

    crud.delete_list(session=session, db_list=db_list)
    return Message(message="Task deleted successfully")
