import secrets
import string


def generate_invite_code(length=8):
    """Generate a secure random invite code."""

    characters = string.ascii_letters + string.digits
    invite_code = "".join(secrets.choice(characters) for _ in range(length))
    return invite_code
