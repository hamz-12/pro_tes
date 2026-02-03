from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.config import settings
from ...core.security import create_access_token
from ...schemas.user import Token, UserCreate, User as UserSchema, UserUpdate
from ...services.auth import authenticate_user, create_user, get_user_by_email, get_user_by_username, update_user
from ...api.deps import get_current_active_user

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    return create_user(db=db, user=user)

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print('data:', form_data.username)
    user = authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: UserSchema = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserSchema)
def update_current_user(
    user_update: UserUpdate,
    current_user: UserSchema = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 1. Validation: If email is changing, check if new email is taken
    if user_update.email and user_update.email != current_user.email:
        if get_user_by_email(db, email=user_update.email):
            raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Validation: If username is changing, check if new username is taken
    if user_update.username and user_update.username != current_user.username:
        if get_user_by_username(db, username=user_update.username):
            raise HTTPException(status_code=400, detail="Username already taken")

    # 3. Call Service to perform update
    updated_user = update_user(db, user_id=current_user.id, user_update=user_update)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return updated_user