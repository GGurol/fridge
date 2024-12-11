import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import Message, Task, TaskCreate, TaskPublic, TasksPublic

router = APIRouter()


@router.get("/{list_id}", response_model=TasksPublic)
def read_tasks(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve tasks.
    """

    db_list = crud.read_list_by_id(session=session, id=list_id)

    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")

    if db_list.family_id and current_user.family_id != db_list.family_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to read another family's tasks",
        )

    if db_list.user_id and current_user.id != db_list.user_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to read another users's tasks",
        )

    return crud.read_list_tasks(
        session=session, list_id=list_id, skip=skip, limit=limit
    )


@router.post("/", response_model=TaskPublic)
def create_task(
    session: SessionDep, current_user: CurrentUserDep, task_in: TaskCreate
) -> Any:
    """
    Create new task.
    """

    if current_user.is_admin:
        return crud.create_task(session=session, task_in=task_in)

    if task_in.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to assign tasks to others",
        )

    return crud.create_task(session=session, task_in=task_in)


@router.patch("/{id}", response_model=TaskPublic)
def complete_task(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
) -> Any:
    """
    Complete task.
    """

    task = crud.read_task_by_id(session=session, id=id)
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
