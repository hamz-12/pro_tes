from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.user import User
from ...models.restaurant import Restaurant
from ...schemas.restaurant import RestaurantCreate, Restaurant as RestaurantSchema
from ...api.deps import get_current_active_user

router = APIRouter()

@router.post("/", response_model=RestaurantSchema)
def create_restaurant(
    restaurant: RestaurantCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_restaurant = Restaurant(
        **restaurant.dict(),
        owner_id=current_user.id
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.get("/", response_model=List[RestaurantSchema])
def read_restaurants(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return restaurants

@router.get("/{restaurant_id}", response_model=RestaurantSchema)
def read_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant