from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import authenticate_user, register_new_user, get_current_user
from app.core.security import create_access_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account (Citizen or Officer) and receive an initial JWT token.
    """
    user = register_new_user(db, user_in)
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user using email and password, returning JWT access token and user profile.
    """
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated"
        )
    
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated user profile based on JWT token in Authorization header.
    """
    return current_user
