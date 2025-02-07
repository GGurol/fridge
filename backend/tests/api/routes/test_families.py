from app.config import settings
from app.core import crud
from fastapi.testclient import TestClient
from sqlmodel import Session

from tests.utils import (
    authenticate_user,
    random_lower_string,
    register_random_admin_user,
    register_random_user,
)


def test_create_family(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    headers = authenticate_user(client=client, email=user.email, password=password)
    params = {"name": random_lower_string()}
    response = client.post(
        f"{settings.API_STR}/families", headers=headers, params=params
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == params["name"]
    assert content["invite_code"]


def test_check_if_user_joined_the_family(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    headers = authenticate_user(client=client, email=user.email, password=password)
    user_db = crud.read_user_by_email(session=db, email=user.email)
    assert user_db.family_id is None

    params = {"name": random_lower_string()}
    r = client.post(f"{settings.API_STR}/families", headers=headers, params=params)
    assert r.status_code == 200

    content = r.json()
    db.refresh(user_db)
    assert str(user_db.family_id) == content["id"]


def test_check_if_user_got_promoted(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    headers = authenticate_user(client=client, email=user.email, password=password)
    user_db = crud.read_user_by_email(session=db, email=user.email)
    assert user_db.is_admin is False

    params = {"name": random_lower_string()}
    r = client.post(f"{settings.API_STR}/families", headers=headers, params=params)
    assert r.status_code == 200

    db.refresh(user_db)
    assert user_db.is_admin is True


def test_check_if_default_lists_got_created(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    headers = authenticate_user(client=client, email=user.email, password=password)
    params = {"name": random_lower_string()}
    r = client.post(f"{settings.API_STR}/families", headers=headers, params=params)
    assert r.status_code == 200

    content = r.json()
    assert content["name"] == params["name"]
    assert content["invite_code"]
    personal_list = crud.read_personal_lists(session=db, user_id=user.id)

    assert personal_list.count == 1
    assert personal_list.data[0].name == settings.DEFAULT_PERSONAL_LIST
    family_list = crud.read_family_lists(session=db, family_id=content["id"])

    assert family_list.count == 1
    assert family_list.data[0].name == settings.DEFAULT_FAMILY_LIST


def test_create_family_user_already_part_of_family(
    db: Session, client: TestClient
) -> None:
    user, password = register_random_user(db)
    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)
    _ = crud.join_family(session=db, db_user=user, family_id=family.id)
    headers = authenticate_user(client=client, email=user.email, password=password)
    params = {"name": random_lower_string()}
    response = client.post(
        f"{settings.API_STR}/families", headers=headers, params=params
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "User is already part of a family"


def test_read_family_members(db: Session, client: TestClient) -> None:
    admin, password = register_random_admin_user(db)
    user, _ = register_random_user(db)

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = crud.join_family(session=db, db_user=admin, family_id=family.id)
    _ = crud.join_family(session=db, db_user=user, family_id=family.id)

    headers = authenticate_user(client=client, email=admin.email, password=password)
    r = client.get(f"{settings.API_STR}/families/{family.id}/members", headers=headers)
    assert r.status_code == 200
    content = r.json()
    assert content["count"] == 2
