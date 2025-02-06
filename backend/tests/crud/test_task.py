from app.core import crud
from app.core.models import TaskCreate, TaskUpdate
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from tests.utils import (
    create_random_personal_list,
    create_random_user,
    random_lower_string,
)


def test_create_task(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    title = random_lower_string()
    task_in = TaskCreate(title=title, user_id=user.id, list_id=personal_list.id)
    task = crud.create_task(session=db, task_in=task_in)
    assert hasattr(task, "id")
    assert task.title == title
    assert task.list_id == personal_list.id
    assert task.user_id == user.id


def test_update_task(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    title = random_lower_string()
    task_in = TaskCreate(title=title, user_id=user.id, list_id=personal_list.id)
    task = crud.create_task(session=db, task_in=task_in)

    new_title = random_lower_string()
    new_task = task.model_dump()
    new_task["title"] = new_title
    task_in_update = TaskUpdate(**new_task)

    updated_task = crud.update_task(session=db, db_task=task, task_in=task_in_update)
    assert updated_task.title == new_title
    assert updated_task.user_id == user.id


def test_reassign_task(db: Session) -> None:
    user_1 = create_random_user(db)
    user_2 = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user_1.id)
    title = random_lower_string()
    task_in = TaskCreate(title=title, user_id=user_1.id, list_id=personal_list.id)
    task = crud.create_task(session=db, task_in=task_in)

    new_task = task.model_dump()
    new_task["user_id"] = user_2.id
    task_in_update = TaskUpdate(**new_task)

    updated_task = crud.update_task(session=db, db_task=task, task_in=task_in_update)
    assert updated_task.user_id == user_2.id


def test_update_task_status(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    title = random_lower_string()
    task_in = TaskCreate(title=title, user_id=user.id, list_id=personal_list.id)
    task = crud.create_task(session=db, task_in=task_in)
    assert task.completed is False
    updated_task = crud.update_task_status(session=db, db_task=task, completed=True)
    assert updated_task.completed is True


def test_delete_task(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    title = random_lower_string()
    task_in = TaskCreate(title=title, user_id=user.id, list_id=personal_list.id)
    task = crud.create_task(session=db, task_in=task_in)
    deleted_task = crud.delete_task(session=db, db_task=task)
    assert deleted_task.id == task.id
    fetched_task = crud.read_task_by_id(session=db, id=task.id)
    assert fetched_task is None


def test_read_task_by_id(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    title = random_lower_string()
    task_in = TaskCreate(title=title, user_id=user.id, list_id=personal_list.id)
    task = crud.create_task(session=db, task_in=task_in)
    fetched_task = crud.read_task_by_id(session=db, id=task.id)
    assert fetched_task
    assert fetched_task.id == task.id
    assert fetched_task.title == task.title
    assert jsonable_encoder(task) == jsonable_encoder(fetched_task)
