from app.core import crud
from app.core.models import UserCreate
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from tests.utils import (
    random_email,
    random_lower_string,
)


def test_create_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.email == email
    assert hasattr(user, "hashed_password")


def test_authenticate_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    authenticated_user = crud.authenticate(session=db, email=email, password=password)
    assert authenticated_user
    assert authenticated_user.email == user.email


def test_not_authenticate_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user = crud.authenticate(session=db, email=email, password=password)
    assert user is None


def test_check_if_user_is_admin(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password, is_admin=True)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_admin is True


def test_check_if_user_is_admin_regular_user(db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=username, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_admin is False


def test_read_user_by_email(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    fetched_user = crud.read_user_by_email(session=db, email=email)
    assert fetched_user
    assert fetched_user.email == user.email
    assert jsonable_encoder(user) == jsonable_encoder(fetched_user)


def test_read_user_by_id(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    fetched_user = crud.read_user_by_id(session=db, id=user.id)
    assert fetched_user
    assert fetched_user.email == user.email
    assert jsonable_encoder(user) == jsonable_encoder(fetched_user)


def test_promote_user_to_admin(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    assert user.is_admin is False
    promoted_user = crud.promote_user_to_admin(session=db, db_user=user)
    assert promoted_user.is_admin is True


def test_demote_admin_to_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password, is_admin=True)
    admin_user = crud.create_user(session=db, user_create=user_in)
    assert admin_user.is_admin is True
    demoted_user = crud.demote_admin_to_user(session=db, db_admin_user=admin_user)
    assert demoted_user.is_admin is False
