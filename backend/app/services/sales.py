import pandas as pd
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models.sales import SalesData, CSVUpload
from ..schemas.sales import SalesDataCreate, ColumnMapping
from ..utils.csv_processor import process_csv_file
from ..utils.data_validator import validate_sales_data

def get_sales_data(db: Session, restaurant_id: int, skip: int = 0, limit: int = 100):
    return db.query(SalesData).filter(
        SalesData.restaurant_id == restaurant_id
    ).offset(skip).limit(limit).all()

def create_sales_data(db: Session, sales_data: SalesDataCreate):
    db_sales_data = SalesData(**sales_data.dict())
    db.add(db_sales_data)
    db.commit()
    db.refresh(db_sales_data)
    return db_sales_data

def create_sales_data_batch(db: Session, sales_data_list: List[SalesDataCreate]):
    db_sales_data_list = [SalesData(**sales_data.dict()) for sales_data in sales_data_list]
    db.add_all(db_sales_data_list)
    db.commit()
    return db_sales_data_list

def upload_csv(db: Session, restaurant_id: int, file_path: str, filename: str, columns_mapping: Dict[str, Any]):
    # Create CSV upload record
    db_csv_upload = CSVUpload(
        filename=filename,
        file_path=file_path,
        columns_mapping=str(columns_mapping),
        restaurant_id=restaurant_id
    )
    db.add(db_csv_upload)
    db.commit()
    db.refresh(db_csv_upload)
    
    # Process CSV file
    try:
        sales_data_list = process_csv_file(file_path, columns_mapping, restaurant_id)
        
        # Validate data
        validated_data = validate_sales_data(sales_data_list)
        
        # Insert data in batch
        create_sales_data_batch(db, validated_data)
        
        # Mark upload as processed
        db_csv_upload.processed = True
        db.commit()
        
        return db_csv_upload
    except Exception as e:
        db.delete(db_csv_upload)
        db.commit()
        raise e

def get_sales_analytics(db: Session, restaurant_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    query = db.query(SalesData).filter(SalesData.restaurant_id == restaurant_id)
    
    if start_date:
        query = query.filter(SalesData.date >= start_date)
    if end_date:
        query = query.filter(SalesData.date <= end_date)
    
    sales_data = query.all()
    
    if not sales_data:
        return {
            "total_revenue": 0,
            "total_transactions": 0,
            "average_transaction_value": 0,
            "top_selling_items": [],
            "sales_by_category": {},
            "sales_by_payment_method": {},
            "sales_by_day_of_week": {},
            "sales_by_hour": {},
            "anomalies": [],
            "insights": []
        }
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame([{
        "date": s.date,
        "item_name": s.item_name,
        "category": s.category,
        "quantity": s.quantity,
        "price": s.price,
        "total_amount": s.total_amount,
        "payment_method": s.payment_method
    } for s in sales_data])
    
    # Calculate metrics
    total_revenue = df["total_amount"].sum()
    total_transactions = len(df)
    average_transaction_value = total_revenue / total_transactions if total_transactions > 0 else 0
    
    # Top selling items
    top_selling_items = df.groupby("item_name")["quantity"].sum().sort_values(ascending=False).head(10).to_dict()
    
    # Sales by category
    sales_by_category = df.groupby("category")["total_amount"].sum().to_dict()
    
    # Sales by payment method
    sales_by_payment_method = df.groupby("payment_method")["total_amount"].sum().to_dict()
    
    # Sales by day of week
    df["day_of_week"] = df["date"].dt.day_name()
    sales_by_day_of_week = df.groupby("day_of_week")["total_amount"].sum().to_dict()
    
    # Sales by hour
    df["hour"] = df["date"].dt.hour
    sales_by_hour = df.groupby("hour")["total_amount"].sum().to_dict()
    
    return {
        "total_revenue": total_revenue,
        "total_transactions": total_transactions,
        "average_transaction_value": average_transaction_value,
        "top_selling_items": [{"item": k, "quantity": v} for k, v in top_selling_items.items()],
        "sales_by_category": sales_by_category,
        "sales_by_payment_method": sales_by_payment_method,
        "sales_by_day_of_week": sales_by_day_of_week,
        "sales_by_hour": sales_by_hour,
        "anomalies": [],  # Will be populated by OpenAI service
        "insights": []    # Will be populated by OpenAI service
    }