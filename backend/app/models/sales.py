from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
from datetime import datetime

class SalesData(Base):
    __tablename__ = "sales_data"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, index=True)
    date = Column(DateTime, nullable=False)
    time = Column(Time, nullable=True)
    item_name = Column(String, nullable=False)
    category = Column(String)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String)
    customer_id = Column(String)
    staff_id = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    restaurant = relationship("Restaurant", back_populates="sales_data")

class CSVUpload(Base):
    __tablename__ = "csv_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    records_processed = Column(Integer, default=0)
    file_size = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    
    restaurant = relationship("Restaurant", back_populates="csv_uploads")