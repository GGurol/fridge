from app.core import crud
from app.core.models import ListCreate, ListUpdate
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from tests.utils import (
    create_random_admin_user,
    create_random_family_list,
    create_random_personal_list,
    create_random_task,
    create_random_user,
    random_lower_string,
)


def test_create_list(db: Session) -> None:
    user = create_random_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    created_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    assert hasattr(created_list, "id")
    assert created_list.is_family_list is False
    assert created_list.name == list_name
    assert created_list.user_id == user.id
    assert created_list.color == "#3B82F6"
    assert created_list.family_id is None
    assert created_list.id is not None


def test_create_personal_list(db: Session) -> None:
    user = create_random_admin_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    personal_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    assert personal_list.is_family_list is False
    assert personal_list.name == list_name
    assert personal_list.user_id == user.id
    assert personal_list.family_id is None
    assert personal_list.id is not None


def test_create_family_list(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name, is_family_list=True)
    family_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"family_id": family.id}
    )
    assert family_list.is_family_list is True
    assert family_list.name == list_name
    assert family_list.user_id is None
    assert family_list.family_id == family.id
    assert family_list.id is not None


def test_check_if_list_is_personal(db: Session) -> None:
    user = create_random_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    personal_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    assert personal_list.is_family_list is False


def test_check_if_list_is_family(db: Session) -> None:
    user = create_random_admin_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name, is_family_list=True)
    family_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    assert family_list.is_family_list is True


def test_read_personal_lists(db: Session) -> None:
    user = create_random_user(db)
    list_1 = create_random_personal_list(db=db, user_id=user.id)
    list_2 = create_random_personal_list(db=db, user_id=user.id)
    lists = crud.read_personal_lists(session=db, user_id=user.id)
    assert lists.count == 2
    assert lists.data[0].id == list_1.id
    assert lists.data[1].id == list_2.id


def test_read_family_lists(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    list_1 = create_random_family_list(db=db, family_id=family.id)
    list_2 = create_random_family_list(db=db, family_id=family.id)
    lists = crud.read_family_lists(session=db, family_id=family.id)
    assert lists
    assert lists.count == 2
    assert lists.data[0].id == list_1.id
    assert lists.data[1].id == list_2.id


def test_read_list_tasks_newest_first(db: Session) -> None:
    user = create_random_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    personal_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    task_1 = create_random_task(db=db, user_id=user.id, list_id=personal_list.id)
    task_2 = create_random_task(db=db, user_id=user.id, list_id=personal_list.id)
    tasks = crud.read_list_tasks(session=db, list_id=personal_list.id)
    assert tasks
    assert tasks.count == 2
    assert tasks.data[0].id == task_2.id
    assert tasks.data[1].id == task_1.id


def test_clear_list_tasks_keeps_uncompleted_tasks(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    _ = create_random_task(
        db=db, user_id=user.id, list_id=personal_list.id, completed=False
    )
    _ = create_random_task(
        db=db, user_id=user.id, list_id=personal_list.id, completed=False
    )
    tasks_before = crud.read_list_tasks(session=db, list_id=personal_list.id)
    assert tasks_before.count == 2
    crud.clear_list_tasks(session=db, list_id=personal_list.id)
    tasks_after = crud.read_list_tasks(session=db, list_id=personal_list.id)
    assert tasks_after.count == 2


def test_clear_list_tasks_removes_only_completed_tasks(db: Session) -> None:
    user = create_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    _ = create_random_task(
        db=db, user_id=user.id, list_id=personal_list.id, completed=True
    )
    _ = create_random_task(
        db=db, user_id=user.id, list_id=personal_list.id, completed=True
    )
    _ = create_random_task(
        db=db, user_id=user.id, list_id=personal_list.id, completed=False
    )
    tasks_before = crud.read_list_tasks(session=db, list_id=personal_list.id)
    assert tasks_before.count == 3
    crud.clear_list_tasks(session=db, list_id=personal_list.id)
    tasks_after = crud.read_list_tasks(session=db, list_id=personal_list.id)
    assert tasks_after.count == 1


def test_update_list(db: Session) -> None:
    user = create_random_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    personal_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )

    new_list_name = random_lower_string()
    new_list_color = "#1138CC"
    list_in_update = ListUpdate(name=new_list_name, color=new_list_color)
    updated_list = crud.update_list(
        session=db, db_list=personal_list, list_in=list_in_update
    )

    assert updated_list.name == new_list_name
    assert updated_list.color == new_list_color


def test_delete_list(db: Session) -> None:
    user = create_random_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    personal_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    _ = crud.delete_list(session=db, db_list=personal_list)
    list_after_deletion = crud.read_list_by_id(session=db, id=personal_list.id)
    assert list_after_deletion is None


def test_read_list_by_id(db: Session) -> None:
    user = create_random_user(db)
    list_name = random_lower_string()
    list_in = ListCreate(name=list_name)
    personal_list = crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user.id}
    )
    fetched_list = crud.read_list_by_id(session=db, id=personal_list.id)
    assert fetched_list.id == personal_list.id
    assert fetched_list.name == personal_list.name
    assert jsonable_encoder(personal_list) == jsonable_encoder(fetched_list)
