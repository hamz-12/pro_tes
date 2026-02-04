# api/v1/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid

from ...core.database import get_db
from ...core.config import settings
from ...core.security import create_access_token, verify_password, get_password_hash
from ...schemas.user import (
    Token, UserCreate, User as UserSchema, UserUpdate, 
    UserWithStats, PasswordChange
)
from ...services.auth import (
    authenticate_user, create_user, get_user_by_email, 
    get_user_by_username, update_user, get_user
)
from ...models.user import User
from ...models.restaurant import Restaurant
from ...models.sales import CSVUpload, SalesData
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
    print(f'Login attempt for: {form_data.username}')
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
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/me/stats", response_model=UserWithStats)
def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get restaurant count
    total_restaurants = db.query(func.count(Restaurant.id)).filter(
        Restaurant.owner_id == current_user.id
    ).scalar() or 0
    
    # Get restaurant IDs for this user
    restaurant_ids = db.query(Restaurant.id).filter(
        Restaurant.owner_id == current_user.id
    ).all()
    restaurant_ids = [r[0] for r in restaurant_ids]
    
    # Get total uploads
    total_uploads = 0
    if restaurant_ids:
        total_uploads = db.query(func.count(CSVUpload.id)).filter(
            CSVUpload.restaurant_id.in_(restaurant_ids)
        ).scalar() or 0
    
    # Get total revenue
    total_revenue = 0.0
    if restaurant_ids:
        total_revenue = db.query(func.sum(SalesData.total_amount)).filter(
            SalesData.restaurant_id.in_(restaurant_ids)
        ).scalar() or 0.0
    
    # Create response with stats
    user_data = UserWithStats(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        bio=current_user.bio,
        location=current_user.location,
        website=current_user.website,
        job_title=current_user.job_title,
        profile_image=current_user.profile_image,
        total_restaurants=total_restaurants,
        total_uploads=total_uploads,
        total_revenue=float(total_revenue)
    )
    
    return user_data

@router.put("/me", response_model=UserSchema)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    
    # Validation: If email is changing, check if new email is taken
    if user_update.email and user_update.email != current_user.email:
        existing_user = get_user_by_email(db, email=user_update.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

    # Validation: If username is changing, check if new username is taken
    if user_update.username and user_update.username != current_user.username:
        existing_user = get_user_by_username(db, username=user_update.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")

    # Call Service to perform update
    updated_user = update_user(db, user_id=current_user.id, user_update=user_update)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return updated_user

@router.post("/me/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/me/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload profile image"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPEG, PNG, GIF, WEBP"
        )
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB"
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"profile_{current_user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    
    # Ensure upload directory exists
    profile_images_dir = os.path.join(settings.UPLOAD_DIR, "profile_images")
    os.makedirs(profile_images_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(profile_images_dir, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Delete old profile image if exists
    if current_user.profile_image:
        old_path = os.path.join(settings.UPLOAD_DIR, current_user.profile_image)
        if os.path.exists(old_path):
            os.remove(old_path)
    
    # Update user profile image path
    current_user.profile_image = f"profile_images/{unique_filename}"
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile image uploaded successfully",
        "image_url": current_user.profile_image
    }

@router.delete("/me/remove-image")
def remove_profile_image(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove profile image"""
    
    if current_user.profile_image:
        # Delete file
        file_path = os.path.join(settings.UPLOAD_DIR, current_user.profile_image)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Update user
        current_user.profile_image = None
        db.commit()
    
    return {"message": "Profile image removed successfully"}