from app.config import settings
from fastapi.testclient import TestClient
from sqlmodel import Session

from tests.utils import authenticate_user, register_random_user


def test_get_access_token(client: TestClient) -> None:
    login_data = {
        "username": settings.TEST_USER,
        "password": settings.TEST_USER_PASSWORD,
    }
    r = client.post(f"{settings.API_STR}/login/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]


def test_get_access_token_incorrect_password(client: TestClient) -> None:
    login_data = {
        "username": settings.TEST_USER,
        "password": "incorrect",
    }
    r = client.post(f"{settings.API_STR}/login/access-token", data=login_data)
    assert r.status_code == 400


def test_use_access_token(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    headers = authenticate_user(client=client, email=user.email, password=password)
    r = client.post(f"{settings.API_STR}/login/test-token", headers=headers)
    result = r.json()
    print(result)
    assert r.status_code == 200
    assert "email" in result
