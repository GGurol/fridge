import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


class FamilyBase(SQLModel):
    """
    Base class for family data with shared properties.
    """

    name: str
    invite_code: str


class Family(FamilyBase, table=True):
    """
    Database model for a family, including an ID and relationships with family members.
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    members: list["User"] = Relationship(back_populates="family")


class FamilyPublic(FamilyBase):
    """Class for family data to be returned via API"""

    id: uuid.UUID


class UserBase(SQLModel):
    """
    Base class for user data with shared properties.
    """

    email: EmailStr = Field(unique=True, index=True, max_length=255)
    name: str | None = Field(default=None, max_length=255)
    is_admin: bool = False


class UserCreate(UserBase):
    """
    Class for user creation with additional password field.
    """

    password: str = Field(min_length=4, max_length=40)


class UserPublic(UserBase):
    """Class for user data to be returned via API, including the user's ID."""

    id: uuid.UUID


class User(UserBase, table=True):
    """
    Database model for a user, including a unique ID and hashed password.
    """

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str

    family_id: uuid.UUID | None = Field(default=None, foreign_key="family.id")
    family: Family | None = Relationship(back_populates="members")

    tasks: list["Task"] = Relationship(back_populates="user")


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    notes: str | None = Field(default=None, max_length=255)
    completed: bool = False


class TaskCreate(TaskBase):
    user_id: uuid.UUID | None = Field(default=None)


class Task(TaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="tasks")


class TasksPublic(SQLModel):
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
