from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.user import User
from ...models.restaurant import Restaurant
from ...schemas.sales import AnalyticsRequest, AnalyticsResponse
from ...services.sales import get_sales_analytics
from ...services.openai_service import detect_anomalies, generate_insights
from ...api.deps import get_current_active_user

router = APIRouter()

@router.post("/", response_model=AnalyticsResponse)
def get_analytics(
    request: AnalyticsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if restaurant belongs to current user
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == request.restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get sales analytics
    analytics_data = get_sales_analytics(
        db=db,
        restaurant_id=request.restaurant_id,
        start_date=request.start_date,
        end_date=request.end_date
    )
    
    # Use OpenAI to detect anomalies
    anomalies = detect_anomalies(analytics_data)
    analytics_data["anomalies"] = anomalies
    
    # Use OpenAI to generate insights
    insights = generate_insights(analytics_data)
    analytics_data["insights"] = insights
    
    return analytics_data