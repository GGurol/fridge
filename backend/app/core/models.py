import uuid

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    """
    Base class for user data with shared properties such as email, full name, and admin status.
    """

    email: EmailStr = Field(unique=True, index=True, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
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
