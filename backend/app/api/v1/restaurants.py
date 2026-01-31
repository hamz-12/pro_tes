# api/v1/restaurants.py
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
    print(f"Creating restaurant with data: {restaurant.dict()}")
    try:
        db_restaurant = Restaurant(
            name=restaurant.name,
            address=restaurant.address,
            phone=restaurant.phone,
            email=restaurant.email,
            description=restaurant.description,
            is_active=True,
            owner_id=current_user.id
        )
        db.add(db_restaurant)
        db.commit()
        db.refresh(db_restaurant)
        print(f"Created restaurant: {db_restaurant}")
        return db_restaurant
    except Exception as e:
        print(f"Error creating restaurant: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating restaurant: {str(e)}")
    
@router.get("/", response_model=List[RestaurantSchema])
def read_restaurants(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"Fetching restaurants for user: {current_user.id}")
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    print(f"Found {len(restaurants)} restaurants")
    for restaurant in restaurants:
        print(f"Restaurant: {restaurant.id} - {restaurant.name}")
    return restaurants

@router.get("/{restaurant_id}", response_model=RestaurantSchema)
def read_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"Fetching restaurant with ID: {restaurant_id} for user: {current_user.id}")
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    if restaurant is None:
        print(f"Restaurant with ID {restaurant_id} not found")
        raise HTTPException(status_code=404, detail="Restaurant not found")
    print(f"Found restaurant: {restaurant}")
    return restaurant