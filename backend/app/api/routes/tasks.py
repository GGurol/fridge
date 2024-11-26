import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import Message, Task, TaskCreate, TaskPublic, TasksPublic

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


@router.post("/", response_model=TaskPublic)
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
            status_code=403,
            detail="Not enough permissions to assign tasks to others.",
        )

    return crud.create_task(session=session, task_in=task_in, user_id=current_user.id)


@router.patch("/{id}", response_model=TaskPublic)
def complete_task(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
) -> Any:
    """
    Complete task.
    """

    task = crud.get_task_by_id(session=session, id=id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to complete another user's task",
        )

    return crud.complete_task(session=session, db_task=task)


@router.delete("/{id}", response_model=Message)
def delete_task(
    session: SessionDep, current_user: CurrentUserDep, id: uuid.UUID
) -> Any:
    """
    Delete task
    """

    task = session.get(Task, id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task.completed:
        raise HTTPException(status_code=403, detail="Cannot delete incomplete task")

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to complete another user's task",
        )

    crud.delete_task(session=session, db_task=task)

    return Message(message="Task deleted successfully")
