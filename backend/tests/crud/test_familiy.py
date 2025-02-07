from app.core import crud
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from tests.utils import (
    create_random_family_list,
    create_random_user,
    random_lower_string,
)


def test_create_family(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    assert hasattr(family, "id")
    assert family.name == family_name
    assert family.id is not None


def test_read_family_lists(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = create_random_family_list(db=db, family_id=family.id)
    _ = create_random_family_list(db=db, family_id=family.id)

    lists = crud.read_family_lists(session=db, family_id=family.id)
    assert lists.count == 2


def test_read_family_members(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    user_1 = create_random_user(db)
    user_2 = create_random_user(db)
    _ = crud.join_family(session=db, db_user=user_1, family_id=family.id)
    _ = crud.join_family(session=db, db_user=user_2, family_id=family.id)

    members = crud.read_family_members(session=db, family_id=family.id)
    assert members.count == 2


def test_join_family(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    user = create_random_user(db)
    assert user.family_id is None
    updated_user = crud.join_family(session=db, db_user=user, family_id=family.id)
    assert updated_user.family_id == family.id


def test_read_family_by_invite_code(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    assert family.invite_code is not None
    fetched_family = crud.read_family_by_invite_code(
        session=db, invite_code=family.invite_code
    )
    assert fetched_family
    assert fetched_family.id == family.id
    assert jsonable_encoder(family) == jsonable_encoder(fetched_family)


def test_read_family_by_id(db: Session) -> None:
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    fetched_family = crud.read_family_by_id(session=db, id=family.id)
    assert fetched_family
    assert fetched_family.id == family.id
    assert jsonable_encoder(family) == jsonable_encoder(fetched_family)
