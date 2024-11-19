from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import Task, TaskCreate, TasksPublic

router = APIRouter()


@router.get("/", response_model=TasksPublic)
def read_tasks(session: SessionDep, current_user: CurrentUserDep) -> Any:
    """
    Retrieve tasks.
    """

    if current_user.is_admin:
        return crud.read_family_tasks(
            session=session, user_id=current_user.id, family_id=current_user.family_id
        )

    return crud.read_user_tasks(session=session, user_id=current_user.id)


@router.post("/", response_model=Task)
def create_task(
    session: SessionDep, current_user: CurrentUserDep, task_in: TaskCreate
) -> Any:
    """
    Create new task.
    """

    if current_user.is_admin:
        return crud.create_task(
            session=session, task_in=task_in, user_id=task_in.user_id or current_user.id
        )

    if task_in.user_id and task_in.user_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Not enough permissions to assign tasks to others.",
        )

    return crud.create_task(session=session, task_in=task_in, user_id=current_user.id)
