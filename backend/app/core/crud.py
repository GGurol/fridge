import uuid

from sqlmodel import Session, func, select

from app.core import security
from app.core.models import (
    Family,
    List,
    ListCreate,
    ListUpdate,
    Task,
    TaskCreate,
    TasksPublic,
    User,
    UserCreate,
)
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


def create_task(*, session: Session, task_in: TaskCreate, user_id: uuid.UUID) -> Task:
    db_task = Task.model_validate(task_in, update={"user_id": user_id})
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def create_list(
    *, session: Session, list_in: ListCreate, relationship_data: dict
) -> List:
    db_list = List.model_validate(list_in, update=relationship_data)
    session.add(db_list)
    session.commit()
    session.refresh(db_list)
    return db_list


def read_user_tasks(
    *, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> TasksPublic:
    count_statement = (
        select(func.count()).select_from(Task).where(Task.user_id == user_id)
    )
    count = session.exec(count_statement).one()
    statement = select(Task).where(Task.user_id == user_id).offset(skip).limit(limit)
    tasks = session.exec(statement).all()
    return TasksPublic(data=tasks, count=count)


def read_family_tasks(
    *,
    session: Session,
    user_id: uuid.UUID,
    family_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> TasksPublic:
    count_statement = (
        select(func.count(Task.id))
        .join(User, User.id == Task.user_id)
        .where(User.family_id == family_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Task)
        .join(User, Task.user_id == User.id)
        .where(User.family_id == family_id)
        .offset(skip)
        .limit(limit)
    )
    tasks = session.exec(statement).all()
    return TasksPublic(data=tasks, count=count)


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


def update_list(*, session: Session, db_list: List, list_in: ListUpdate) -> List:
    list_data = list_in.model_dump(exclude_unset=True)
    db_list.sqlmodel_update(list_data)
    session.add(db_list)
    session.commit()
    session.refresh(db_list)
    return db_list


def join_family(*, session: Session, db_user: User, family_id: uuid.UUID) -> User:
    db_user.sqlmodel_update({"family_id": family_id})
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def complete_task(*, session: Session, db_task: Task) -> Task:
    db_task.sqlmodel_update({"completed": True})
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


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


def get_user_by_id(*, session: Session, id: uuid.UUID) -> User | None:
    """
    Fetches a user from the database by their id.
    """

    statement = select(User).where(User.id == id)
    session_user = session.exec(statement).first()
    return session_user


def get_task_by_id(*, session: Session, id: uuid.UUID) -> Task | None:
    """
    Fetches a task from the database by their id.
    """

    statement = select(Task).where(Task.id == id)
    session_task = session.exec(statement).first()
    return session_task


def get_list_by_id(*, session: Session, id: uuid.UUID) -> List | None:
    """
    Fetches a task from the database by their id.
    """

    statement = select(List).where(List.id == id)
    session_task = session.exec(statement).first()
    return session_task


def get_family_by_invite_code(*, session: Session, invite_code: str) -> Family | None:
    """
    Fetches a family from the database by their invite code.
    """

    statement = select(Family).where(Family.invite_code == invite_code)
    session_family = session.exec(statement).first()
    return session_family
