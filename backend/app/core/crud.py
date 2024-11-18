from sqlmodel import Session, select

from app.core import security
from app.core.models import Family, User, UserCreate
from app.core.utils import generate_invite_code


def create_user(*, session: Session, user_create: UserCreate) -> User:
    """
    Creates a new user in the database and returns the created user object.
    """

    db_user = User.model_validate(
        user_create,
        update={"hashed_password": security.get_password_hash(user_create.password)},
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def create_family(*, session: Session, name: str, db_user: User) -> Family:
    db_family = Family(name=name, invite_code=generate_invite_code(), members=[db_user])
    session.add(db_family)
    session.commit()
    session.refresh(db_family)
    return db_family


def promote_user_to_admin(*, session, db_user: User) -> User:
    db_user.sqlmodel_update({"is_admin": True})
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def join_family(*, session: Session, db_user: User, family_id: str) -> User:
    db_user.sqlmodel_update({"family_id": family_id})
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    """
    Authenticates a user by checking the provided email and password against the database.
    """

    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not security.verify_password(password, db_user.hashed_password):
        return None
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    """
    Fetches a user from the database by their email address.
    """

    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def get_user_by_id(*, session: Session, id: str) -> User | None:
    """
    Fetches a user from the database by their email address.
    """

    statement = select(User).where(User.id == id)
    session_user = session.exec(statement).first()
    return session_user


def get_family_by_invite_code(*, session: Session, invite_code: str) -> Family | None:
    """
    Fetches a family from the database by their invite code.
    """

    statement = select(Family).where(Family.invite_code == invite_code)
    session_family = session.exec(statement).first()
    return session_family
