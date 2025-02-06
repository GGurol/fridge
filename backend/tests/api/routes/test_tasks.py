import uuid

from app.config import settings
from app.core import crud
from fastapi.testclient import TestClient
from sqlmodel import Session

from tests.utils import (
    authenticate_user,
    create_random_family_list,
    create_random_personal_list,
    create_random_task,
    random_lower_string,
    register_random_admin_user,
    register_random_user,
)


def test_create_task(db: Session, client: TestClient) -> None:
    user, password = register_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    headers = authenticate_user(client=client, email=user.email, password=password)
    data = {
        "title": random_lower_string(),
        "user_id": str(user.id),
        "list_id": str(personal_list.id),
    }
    response = client.post(f"{settings.API_STR}/tasks", headers=headers, json=data)
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]


def test_assign_task(db: Session, client: TestClient) -> None:
    admin, password = register_random_admin_user(db)
    user, _ = register_random_user(db)

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = crud.join_family(session=db, db_user=admin, family_id=family.id)
    _ = crud.join_family(session=db, db_user=user, family_id=family.id)

    family_list = create_random_family_list(db=db, family_id=family.id)

    headers = authenticate_user(client=client, email=admin.email, password=password)

    data = {
        "title": random_lower_string(),
        "user_id": str(user.id),
        "list_id": str(family_list.id),
    }
    response = client.post(f"{settings.API_STR}/tasks", headers=headers, json=data)
    assert response.status_code == 200
    content = response.json()
    task = crud.read_task_by_id(session=db, id=content["id"])
    assert task.user_id == user.id


def test_assign_task_regular_user(db: Session, client: TestClient) -> None:
    user_1, password = register_random_user(db)
    user_2, _ = register_random_user(db)

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    _ = crud.join_family(session=db, db_user=user_1, family_id=family.id)
    _ = crud.join_family(session=db, db_user=user_2, family_id=family.id)

    family_list = create_random_family_list(db=db, family_id=family.id)

    headers = authenticate_user(client=client, email=user_1.email, password=password)

    data = {
        "title": random_lower_string(),
        "user_id": str(user_2.id),
        "list_id": str(family_list.id),
    }
    response = client.post(f"{settings.API_STR}/tasks", headers=headers, json=data)
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions to assign tasks to others"


def test_assign_task_another_family(db: Session, client: TestClient) -> None:
    admin, password = register_random_admin_user(db)

    family_name = random_lower_string()
    family = crud.create_family(session=db, name=family_name)

    family_list = create_random_family_list(db=db, family_id=family.id)

    headers = authenticate_user(client=client, email=admin.email, password=password)

    data = {
        "title": random_lower_string(),
        "user_id": str(admin.id),
        "list_id": str(family_list.id),
    }
    response = client.post(f"{settings.API_STR}/tasks", headers=headers, json=data)
    assert response.status_code == 403
    content = response.json()
    assert (
        content["detail"]
        == "Not enough permissions to create a task in another family's list"
    )


def test_create_task_not_list_owner(db: Session, client: TestClient) -> None:
    user_1, password = register_random_user(db)
    user_2, _ = register_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user_2.id)

    headers = authenticate_user(client=client, email=user_1.email, password=password)

    data = {
        "title": random_lower_string(),
        "user_id": str(user_1.id),
        "list_id": str(personal_list.id),
    }
    response = client.post(f"{settings.API_STR}/tasks", headers=headers, json=data)
    assert response.status_code == 403
    content = response.json()
    assert (
        content["detail"]
        == "Not enough permissions to create tasks in another user's list"
    )


def test_update_task_not_found(db: Session, client: TestClient) -> None:
    user_1, password = register_random_user(db)
    user_2, _ = register_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user_2.id)
    headers = authenticate_user(client=client, email=user_1.email, password=password)
    data = {
        "title": random_lower_string(),
        "user_id": str(user_1.id),
        "list_id": str(personal_list.id),
    }
    response = client.patch(
        f"{settings.API_STR}/tasks/{uuid.uuid4()}", headers=headers, json=data
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Task not found"


def test_delete_incomplete_task(client: TestClient, db: Session) -> None:
    user, password = register_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    task = create_random_task(db=db, user_id=user.id, list_id=personal_list.id)

    headers = authenticate_user(client=client, email=user.email, password=password)
    response = client.delete(f"{settings.API_STR}/tasks/{task.id}", headers=headers)
    content = response.json()
    assert response.status_code == 403
    assert content["detail"] == "Cannot delete incomplete task"


def test_delete_task(client: TestClient, db: Session) -> None:
    user, password = register_random_user(db)
    personal_list = create_random_personal_list(db=db, user_id=user.id)
    task = create_random_task(
        db=db, user_id=user.id, list_id=personal_list.id, completed=True
    )
    headers = authenticate_user(client=client, email=user.email, password=password)
    response = client.delete(f"{settings.API_STR}/tasks/{task.id}", headers=headers)
    content = response.json()
    assert response.status_code == 200
    assert content["message"] == "Task deleted successfully"
