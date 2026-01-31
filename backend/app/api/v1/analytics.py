from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...models.user import User
from ...models.restaurant import Restaurant
from ...schemas.sales import AnalyticsRequest, AnalyticsResponse
from ...services.sales import get_sales_analytics
from ...services.llm_services import detect_anomalies, generate_insights
from ...api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=AnalyticsResponse)
def get_analytics(
    restaurant_id: int = Query(..., description="Restaurant ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for analytics"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"Fetching analytics for restaurant: {restaurant_id}")
    
    # Check if restaurant belongs to current user
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        print(f"Restaurant with ID {restaurant_id} not found for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get sales analytics
    analytics_data = get_sales_analytics(db, restaurant_id, start_date, end_date)
    
    # If no sales data, return default values
    if not analytics_data['summary']['total_transactions']:
        analytics_data['anomalies'] = []
        analytics_data['insights'] = ["Upload sales data to see insights and analytics"]
        print("No sales data found, returning default values")
    else:
        # Generate AI insights only if we have data
        try:
            analytics_data['anomalies'] = detect_anomalies(analytics_data)
            analytics_data['insights'] = generate_insights(analytics_data)
            print("Generated AI insights and anomalies")
        except Exception as e:
            print(f"Error generating AI insights: {str(e)}")
            analytics_data['anomalies'] = [{
                "description": f"AI Analysis Error: {str(e)}",
                "impact": "Unknown",
                "explanation": "Failed to generate insights"
            }]
            analytics_data['insights'] = ["Unable to generate insights at this time"]
    
    print(f"Returning analytics data: {analytics_data}")
    return analytics_data