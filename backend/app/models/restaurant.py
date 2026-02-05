from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
from datetime import datetime

class Restaurant(Base):
    __tablename__ = "restaurants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    description = Column(Text, nullable=True) 
    is_active = Column(Boolean, default=True)  
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  
    
    # Relationships
    owner = relationship("User", back_populates="restaurants")
    sales_data = relationship("SalesData", back_populates="restaurant", cascade="all, delete-orphan")
    csv_uploads = relationship("CSVUpload", back_populates="restaurant", cascade="all, delete-orphan")