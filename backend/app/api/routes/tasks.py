import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUserDep, SessionDep
from app.core import crud
from app.core.models import (
    Message,
    TaskCreate,
    TaskPublic,
    TasksPublic,
    TaskUpdate,
)

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
    db_list = crud.read_list_by_id(session=session, id=task_in.list_id)

    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")

    # Family list
    if db_list.is_family_list:
        if current_user.family_id != db_list.family_id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to create a task in another family's list",
            )

        # Admins can assign tasks to anyone (including themselves)
        if current_user.is_admin:
            return crud.create_task(session=session, task_in=task_in)

        # Regular users can only create tasks for themselves
        if current_user.id != task_in.user_id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to assign tasks to others",
            )

        return crud.create_task(session=session, task_in=task_in)

    # Personal list
    # Tasks must always belong to the list owner
    if current_user.id != db_list.user_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to create tasks in another user's list",
        )

    return crud.create_task(session=session, task_in=task_in)


@router.patch("/{task_id}", response_model=TaskPublic)
def update_task(
    session: SessionDep,
    current_user: CurrentUserDep,
    task_id: uuid.UUID,
    task_in: TaskUpdate,
) -> Any:
    """
    Update task.
    """

    task = crud.read_task_by_id(session=session, id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != current_user.id:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to update another user's task",
            )

        db_list = crud.read_list_by_id(session=session, id=task.list_id)

        if db_list.family_id != current_user.family_id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to update someone else's family task.",
            )

    return crud.update_task(session=session, db_task=task, task_in=task_in)


@router.patch("/{task_id}/status", response_model=TaskPublic)
def update_task_status(
    session: SessionDep,
    current_user: CurrentUserDep,
    task_id: uuid.UUID,
    completed: bool,
) -> Any:
    """
    Update task status.
    """

    task = crud.read_task_by_id(session=session, id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to complete another user's task",
        )

    return crud.update_task_status(session=session, db_task=task, completed=completed)


@router.delete("clear/{list_id}", response_model=Message)
def clear_tasks(
    session: SessionDep, current_user: CurrentUserDep, list_id: uuid.UUID
) -> Any:
    """
    Delete task
    """

    db_list = crud.read_list_by_id(session=session, id=list_id)

    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")

    if db_list.family_id and current_user.family_id != db_list.family_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to clear another family's tasks",
        )

    if db_list.user_id and current_user.id != db_list.user_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to clear another users's tasks",
        )

    crud.clear_list_tasks(session=session, list_id=list_id)

    return Message(message="Task deleted successfully")


@router.delete("/{task_id}", response_model=Message)
def delete_task(
    session: SessionDep, current_user: CurrentUserDep, task_id: uuid.UUID
) -> Any:
    """
    Delete task
    """

    task = crud.read_task_by_id(session=session, id=task_id)

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
