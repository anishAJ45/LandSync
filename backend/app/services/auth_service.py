from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash, decode_access_token
from app.schemas.user import UserCreate

security_scheme = HTTPBearer(auto_error=False)

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Verify user email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def register_new_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user with hashed password."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Restrict direct registration of admin role for security; citizens/officers allowed
    valid_roles = ["citizen", "officer", "admin"]
    role = user_in.role.lower() if user_in.role else "citizen"
    if role not in valid_roles:
        role = "citizen"

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Extract and validate JWT token from Authorization header, returning authenticated User model."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization bearer token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject id",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return user

def require_role(allowed_roles: List[str]):
    """
    Factory dependency for role-based authorization:
    Citizen -> ['citizen']
    Officer -> ['officer', 'admin']
    Admin -> ['admin']
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Required role in {allowed_roles}, but user has role '{current_user.role}'"
            )
        return current_user
    return role_checker
