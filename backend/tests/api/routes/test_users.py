import uuid

from app.config import settings
from app.core import crud, security
from fastapi.testclient import TestClient
from sqlmodel import Session

from tests.utils import (
    authenticate_user,
    random_email,
    random_lower_string,
    register_random_admin_user,
    register_random_user,
)


def test_get_users_me(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    headers = authenticate_user(client=client, email=user.email, password=password)
    response = client.get(f"{settings.API_STR}/users/me", headers=headers)
    assert response.status_code == 200
    current_user = response.json()
    assert current_user
    assert current_user["is_admin"] is False
    assert current_user["email"] == user.email


def test_register_user(db: Session, client: TestClient) -> None:
    email = random_email()
    password = random_lower_string()
    data = {"email": email, "password": password}
    response = client.post(f"{settings.API_STR}/users/signup", json=data)
    assert response.status_code == 200
    created_user = response.json()
    assert created_user["email"] == email
    user_db = crud.read_user_by_email(session=db, email=email)
    assert user_db
    assert user_db.email == email
    assert security.verify_password(password, user_db.hashed_password)


def test_register_user_already_exists(db: Session, client: TestClient) -> None:
    data = {"email": settings.TEST_USER, "password": settings.TEST_USER_PASSWORD}
    response = client.post(f"{settings.API_STR}/users/signup", json=data)
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "The user with this email already exists in the system"


def test_promote_user_to_admin(db: Session, client: TestClient) -> None:
    admin, password = register_random_admin_user(db)
    user, _ = register_random_user(db)

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = crud.join_family(session=db, db_user=admin, family_id=family.id)
    _ = crud.join_family(session=db, db_user=user, family_id=family.id)

    headers = authenticate_user(client=client, email=admin.email, password=password)
    response = client.post(
        f"{settings.API_STR}/users/promote/{user.id}", headers=headers
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "User promoted to admin successfully"


def test_promote_user_to_admin_with_regular_user(
    db: Session, client: TestClient
) -> None:
    user_1, password = register_random_user(db)
    user_2, _ = register_random_user(db)

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = crud.join_family(session=db, db_user=user_1, family_id=family.id)
    _ = crud.join_family(session=db, db_user=user_2, family_id=family.id)

    headers = authenticate_user(client=client, email=user_1.email, password=password)
    response = client.post(
        f"{settings.API_STR}/users/promote/{user_1.id}", headers=headers
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "The user doesn't have enough privileges"


def test_promote_user_to_admin_user_not_exists(db: Session, client: TestClient) -> None:
    admin, password = register_random_admin_user(db)
    user_id = uuid.uuid4()

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = crud.join_family(session=db, db_user=admin, family_id=family.id)

    headers = authenticate_user(client=client, email=admin.email, password=password)
    response = client.post(
        f"{settings.API_STR}/users/promote/{user_id}", headers=headers
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "User not found"


def test_promote_user_to_admin_another_family_user(
    db: Session, client: TestClient
) -> None:
    admin, password = register_random_admin_user(db)
    user, _ = register_random_user(db)

    family_1_name = random_lower_string()
    family_1 = crud.create_family(session=db, name=family_1_name)
    family_2_name = random_lower_string()
    family_2 = crud.create_family(session=db, name=family_2_name)

    _ = crud.join_family(session=db, db_user=admin, family_id=family_1.id)
    _ = crud.join_family(session=db, db_user=user, family_id=family_2.id)

    headers = authenticate_user(client=client, email=admin.email, password=password)
    response = client.post(
        f"{settings.API_STR}/users/promote/{user.id}", headers=headers
    )
    assert response.status_code == 403
    content = response.json()
    assert (
        content["detail"] == "Not enough permissions to promote another family's user"
    )
