import random
import string
import uuid

from app.config import settings
from app.core import crud
from app.core.models import List, ListCreate, Task, TaskCreate, User, UserCreate
from fastapi.testclient import TestClient
from sqlmodel import Session


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def create_random_user(db: Session) -> User:
    user_in = UserCreate(email=random_email(), password=random_lower_string())
    return crud.create_user(session=db, user_create=user_in)


def register_random_user(db: Session) -> tuple[User, str]:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    return user, password


def create_random_admin_user(db: Session) -> User:
    user_in = UserCreate(
        email=random_email(), password=random_lower_string(), is_admin=True
    )
    return crud.create_user(session=db, user_create=user_in)


def register_random_admin_user(db: Session) -> tuple[User, str]:
    email = random_email()
    password = random_lower_string()
    admin_in = UserCreate(email=email, password=password, is_admin=True)
    admin = crud.create_user(session=db, user_create=admin_in)
    return admin, password


def authenticate_user(
    *, client: TestClient, email: str, password: str
) -> dict[str, str]:
    data = {"username": email, "password": password}

    r = client.post(f"{settings.API_STR}/login/access-token", data=data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


def create_random_task(
    *, db: Session, user_id: uuid.UUID, list_id: uuid.UUID, completed: bool = False
) -> Task:
    task_in = TaskCreate(
        title=random_lower_string(),
        user_id=user_id,
        list_id=list_id,
        completed=completed,
    )
    return crud.create_task(session=db, task_in=task_in)


def create_random_personal_list(*, db: Session, user_id: uuid.UUID) -> List:
    list_in = ListCreate(name=random_lower_string())
    return crud.create_list(
        session=db, list_in=list_in, relationship_data={"user_id": user_id}
    )


def create_random_family_list(*, db: Session, family_id: uuid.UUID) -> List:
    list_in = ListCreate(name=random_lower_string(), is_family_list=True)
    return crud.create_list(
        session=db, list_in=list_in, relationship_data={"family_id": family_id}
    )
