from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "officer"]))
):
    """
    Retrieve list of users. Accessible only by Officers and Administrators.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user by ID. Citizens can only view their own profile; Officers and Admins can view any.
    """
    if current_user.role == "citizen" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view other citizen profiles"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user profile. Citizens can edit their own name/email; Admins can edit roles and status.
    """
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only update your own profile"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.email is not None:
        # Check uniqueness
        existing = db.query(User).filter(User.email == user_in.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        user.email = user_in.email
        
    # Only admin can promote roles or activate/deactivate accounts
    if current_user.role == "admin":
        if user_in.role is not None:
            user.role = user_in.role
        if user_in.is_active is not None:
            user.is_active = user_in.is_active

    db.commit()
    db.refresh(user)
    return user
