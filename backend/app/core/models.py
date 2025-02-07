import uuid
from datetime import datetime
from typing import TypedDict

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import generate_invite_code


class FamilyBase(SQLModel):
    """
    Base class for family data with shared properties.
    """

    name: str = Field(min_length=1, max_length=255)
    invite_code: str = Field(
        default_factory=generate_invite_code, min_length=8, max_length=8
    )


class Family(FamilyBase, table=True):
    """
    Database model for a family.
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    members: list["User"] = Relationship(back_populates="family", cascade_delete=True)
    lists: list["List"] = Relationship(back_populates="family", cascade_delete=True)


class FamilyPublic(FamilyBase):
    """Class for family data to be returned via API"""

    id: uuid.UUID


class UserBase(SQLModel):
    """
    Base class for user data with shared properties.
    """

    email: EmailStr = Field(unique=True, index=True, max_length=255)
    name: str | None = Field(default=None, max_length=255)
    is_admin: bool = Field(default=False)


class UserCreate(UserBase):
    """
    Class for user creation with additional password field.
    """

    password: str = Field(min_length=4, max_length=40)


class UserPublic(UserBase):
    """
    Class for user data to be returned via API, including the user's ID.
    """

    id: uuid.UUID
    family_id: uuid.UUID | None


class User(UserBase, table=True):
    """
    Database model for a user.
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str

    family_id: uuid.UUID | None = Field(
        default=None, foreign_key="family.id", ondelete="CASCADE"
    )
    family: Family | None = Relationship(back_populates="members")

    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)
    lists: list["List"] = Relationship(back_populates="user", cascade_delete=True)


class UsersPublic(SQLModel):
    """
    Class for user data to be returned via API
    """

    data: list[UserPublic]
    count: int


class ListBase(SQLModel):
    """
    Base class for list data with shared properties.
    """

    name: str = Field(min_length=1, max_length=255)
    is_family_list: bool = False
    color: str = Field(
        default="#3B82F6",
        min_length=7,
        max_length=7,
        description="Hex color code in the format #1138CC",
    )


class ListCreate(ListBase):
    pass


class ListUpdate(SQLModel):
    """
    Update model for List
    """

    name: str | None = Field(default=None, min_length=1, max_length=255)
    color: str | None = Field(
        default=None,
        min_length=7,
        max_length=7,
        description="Hex color code in the format #1138CC",
    )


class List(ListBase, table=True):
    """
    Database  model for List
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    user_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="CASCADE"
    )
    user: User | None = Relationship(back_populates="lists")

    family_id: uuid.UUID | None = Field(
        default=None, foreign_key="family.id", ondelete="CASCADE"
    )
    family: Family | None = Relationship(back_populates="lists")

    tasks: list["Task"] = Relationship(back_populates="list", cascade_delete=True)


class ListPublic(ListBase):
    """
    Class for list data to be returned via API.
    """

    id: uuid.UUID


class ListDisplay(ListBase):
    """
    Class for display list data to be returned via API.
    """

    id: uuid.UUID
    task_count: int


class ListsPublic(SQLModel):
    """
    Class for display lists data to be returned via API.
    """

    data: list[ListDisplay]
    count: int


class TaskBase(SQLModel):
    """
    Base class for task data with shared properties.
    """

    title: str = Field(min_length=1, max_length=255)
    notes: str | None = Field(default=None, max_length=255)
    completed: bool = False


class TaskPublic(TaskBase):
    """
    Class for list data to be returned via API.
    """

    id: uuid.UUID


class TaskUpdate(TaskBase):
    """
    Class for updating task.
    """

    user_id: uuid.UUID


class TaskCreate(TaskBase):
    """
    Class for creating task.
    """

    user_id: uuid.UUID
    list_id: uuid.UUID


class Task(TaskBase, table=True):
    """
    Database  model for List
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    user: User = Relationship(back_populates="tasks")

    list_id: uuid.UUID = Field(foreign_key="list.id", ondelete="CASCADE")
    list: List = Relationship(back_populates="tasks")


class TasksPublic(SQLModel):
    """
    Class for display lists data to be returned via API.
    """

    data: list[Task]
    count: int


class Token(SQLModel):
    """
    Class representing the JSON payload containing an access token and its type.
    """

    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    """
    Class representing the contents of a JWT token, with a subject field.
    """

    sub: str | None = None


class Message(SQLModel):
    """
    Class representing the message model.
    """

    message: str


class UserRelationship(TypedDict):
    """
    Class typing the user relationship data.
    """

    user_id: uuid.UUID


class FamilyRelationship(TypedDict):
    """
    Class typing the family relationship data.
    """

    family_id: uuid.UUID
