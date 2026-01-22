from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SalesDataBase(BaseModel):
    transaction_id: Optional[str] = None
    date: datetime
    item_name: str
    category: Optional[str] = None
    quantity: int = 1
    price: float
    total_amount: float
    payment_method: Optional[str] = None
    customer_id: Optional[str] = None
    staff_id: Optional[str] = None
    notes: Optional[str] = None

class SalesDataCreate(SalesDataBase):
    restaurant_id: int

class SalesData(SalesDataBase):
    id: int
    restaurant_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class CSVUploadCreate(BaseModel):
    filename: str
    file_path: str
    columns_mapping: Dict[str, Any]

class CSVUpload(BaseModel):
    id: int
    filename: str
    file_path: str
    upload_date: datetime
    processed: bool
    columns_mapping: Dict[str, Any]
    restaurant_id: int
    
    class Config:
        orm_mode = True

class ColumnMapping(BaseModel):
    date: str
    item_name: str
    category: Optional[str] = None
    quantity: Optional[str] = None
    price: str
    total_amount: Optional[str] = None
    payment_method: Optional[str] = None
    customer_id: Optional[str] = None
    staff_id: Optional[str] = None
    notes: Optional[str] = None

class AnalyticsRequest(BaseModel):
    restaurant_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AnalyticsResponse(BaseModel):
    total_revenue: float
    total_transactions: int
    average_transaction_value: float
    top_selling_items: List[Dict[str, Any]]
    sales_by_category: Dict[str, float]
    sales_by_payment_method: Dict[str, float]
    sales_by_day_of_week: Dict[str, float]
    sales_by_hour: Dict[str, float]
    anomalies: List[Dict[str, Any]]
    insights: List[str]