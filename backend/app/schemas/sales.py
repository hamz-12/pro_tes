# schemas/sales.py
from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional, List, Dict, Any, Union

class SalesDataBase(BaseModel):
    transaction_id: Optional[str] = None
    date: datetime
    time: Optional[time] = None
    item_name: str
    category: Optional[str] = None
    quantity: int = 1
    price: float
    total_amount: float
    payment_method: Optional[str] = None
    customer_id: Optional[str] = None
    staff_id: Optional[str] = None
    notes: Optional[str] = None
    purchase_type: Optional[str] = None
    manager: Optional[str] = None
    city: Optional[str] = None

class SalesDataCreate(SalesDataBase):
    restaurant_id: int

class SalesData(SalesDataBase):
    id: int
    restaurant_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CSVUploadBase(BaseModel):
    filename: str
    processed: bool
    records_processed: int = 0
    file_size: int = 0

class CSVUploadCreate(CSVUploadBase):
    restaurant_id: int
    file_path: str

class CSVUpload(CSVUploadBase):
    id: int
    restaurant_id: int
    file_path: str
    upload_date: datetime
    
    class Config:
        from_attributes = True 

class ColumnMapping(BaseModel):
    column_name: str
    field_name: str

class AnalyticsRequest(BaseModel):
    restaurant_id: int
    start_date: datetime
    end_date: datetime

class AnalyticsResponse(BaseModel):
    summary: Dict[str, Any]
    daily_sales: List[Dict[str, Any]]
    top_items: List[Dict[str, Any]]
    sales_by_category: Union[Dict[str, float], List[Dict[str, Any]]]
    sales_by_payment_method: Dict[str, Any]
    sales_by_day_of_week: Dict[str, Any]
    sales_by_hour: Union[Dict[str, Any], List[Dict[str, Any]]]
    sales_by_purchase_type: Dict[str, Any]
    sales_by_manager: Dict[str, Any]
    sales_by_city: Dict[str, Any]
    anomalies: List[Dict[str, Any]]
    insights: List[str]