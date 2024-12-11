import uuid

from sqlmodel import Session, func, select

from app.core import security
from app.core.models import (
    Family,
    List,
    ListCreate,
    ListDisplay,
    ListsPublic,
    ListUpdate,
    Task,
    TaskCreate,
    TasksPublic,
    User,
    UserCreate,
    UsersPublic,
)


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


def create_task(*, session: Session, task_in: TaskCreate) -> Task:
    db_task = Task.model_validate(task_in)
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


def read_personal_lists(
    *, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List:
    count_statement = (
        select(func.count()).select_from(List).where(List.user_id == user_id)
    )
    count = session.exec(count_statement).one()
    statement = select(List).where(List.user_id == user_id).offset(skip).limit(limit)
    db_lists = session.exec(statement).all()
    data = []
    for db_list in db_lists:
        task_count_statement = (
            select(func.count()).select_from(Task).where(Task.list_id == db_list.id)
        )
        task_count = session.exec(task_count_statement).one()
        list_display = ListDisplay.model_validate(
            db_list, update={"task_count": task_count}
        )
        data.append(list_display)

    return ListsPublic(data=data, count=count)


def read_list_tasks(
    *, session: Session, list_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List:
    count_statement = (
        select(func.count()).select_from(Task).where(Task.list_id == list_id)
    )
    count = session.exec(count_statement).one()
    statement = select(Task).where(Task.list_id == list_id).offset(skip).limit(limit)
    tasks = session.exec(statement).all()
    return TasksPublic(data=tasks, count=count)


def read_family_lists(
    *, session: Session, family_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List:
    count_statement = (
        select(func.count()).select_from(List).where(List.family_id == family_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(List).where(List.family_id == family_id).offset(skip).limit(limit)
    )
    db_lists = session.exec(statement).all()
    data = []
    for db_list in db_lists:
        task_count_statement = (
            select(func.count()).select_from(Task).where(Task.list_id == db_list.id)
        )
        task_count = session.exec(task_count_statement).one()
        list_display = ListDisplay.model_validate(
            db_list, update={"task_count": task_count}
        )
        data.append(list_display)

    return ListsPublic(data=data, count=count)


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


def read_family_members(
    *,
    session: Session,
    family_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> UsersPublic:
    count_statement = select(func.count(User.id)).where(User.family_id == family_id)
    count = session.exec(count_statement).one()
    statement = (
        select(User).where(User.family_id == family_id).offset(skip).limit(limit)
    )
    users = session.exec(statement).all()
    return UsersPublic(data=users, count=count)


def create_family(*, session: Session, name: str) -> Family:
    db_family = Family(name=name)
    session.add(db_family)
    session.commit()
    session.refresh(db_family)
    return db_family


def promote_user_to_admin(*, session: Session, db_user: User) -> User:
    db_user.sqlmodel_update({"is_admin": True})
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def demote_admin_to_user(*, session: Session, db_admin_user: User) -> User:
    db_admin_user.sqlmodel_update({"is_admin": False})
    session.add(db_admin_user)
    session.commit()
    session.refresh(db_admin_user)
    return db_admin_user


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


def delete_task(*, session: Session, db_task: Task) -> Task:
    session.delete(db_task)
    session.commit()
    return db_task


def delete_list(*, session: Session, db_list: List) -> List:
    session.delete(db_list)
    session.commit()
    return db_list


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    """
    Authenticates a user by checking the provided email and password against the database.
    """

    db_user = read_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not security.verify_password(password, db_user.hashed_password):
        return None
    return db_user


def read_user_by_email(*, session: Session, email: str) -> User | None:
    """
    Fetches a user from the database by their email address.
    """

    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def read_user_by_id(*, session: Session, id: uuid.UUID) -> User | None:
    """
    Fetches a user from the database by their id.
    """

    statement = select(User).where(User.id == id)
    session_user = session.exec(statement).first()
    return session_user


def read_task_by_id(*, session: Session, id: uuid.UUID) -> Task | None:
    """
    Fetches a task from the database by their id.
    """

    statement = select(Task).where(Task.id == id)
    session_task = session.exec(statement).first()
    return session_task


def read_list_by_id(*, session: Session, id: uuid.UUID) -> List | None:
    """
    Fetches a task from the database by their id.
    """

    statement = select(List).where(List.id == id)
    session_list = session.exec(statement).first()
    return session_list


def read_family_by_invite_code(*, session: Session, invite_code: str) -> Family | None:
    """
    Fetches a family from the database by their invite code.
    """

    statement = select(Family).where(Family.invite_code == invite_code)
    session_family = session.exec(statement).first()
    return session_family


def read_family_by_id(*, session: Session, id: uuid.UUID) -> Family | None:
    """
    Fetches a family from the database by their invite code.
    """

    statement = select(Family).where(Family.id == id)
    session_family = session.exec(statement).first()
    return session_family
