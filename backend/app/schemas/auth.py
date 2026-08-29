from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

# Avoid circular imports in Pydantic
from app.schemas.user import UserResponse
Token.model_rebuild()
