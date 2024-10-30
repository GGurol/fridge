from app.core import security
from app.core.models import User

fake_users_db = {
    "johndoe@example.com": {
        "email": "johndoe@example.com",
        "full_name": "John Doe",
        "id_admin": True,
        "id": "a5374475-2e9a-489d-9f09-e54f2c430325",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    }
}


def authenticate(*, email: str, password: str) -> User | None:
    user = get_user_by_email(email=email)
    db_user = User(**user)

    if not db_user:
        return None
    if not security.verify_password(password, db_user.hashed_password):
        return None
    return db_user


def get_user_by_email(*, email: str):
    if email not in fake_users_db:
        return None

    return fake_users_db[email]


def get_user_by_id(*, user_id: str):
    for value in fake_users_db.values():
        if value["id"] == user_id:
            return value
