import pandas as pd
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models.sales import SalesData, CSVUpload
from ..schemas.sales import SalesDataCreate, ColumnMapping
from ..utils.csv_processor import process_csv_file
from ..utils.data_validator import validate_sales_data
import os

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

def upload_csv(
    db: Session,
    restaurant_id: int,
    file_path: str,
    filename: str,
    columns_mapping: Dict[str, str]
) -> CSVUpload:

    try:
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create CSV upload record
        csv_upload = CSVUpload(
            restaurant_id=restaurant_id,
            filename=filename,
            file_path=file_path,
            processed=False,
            file_size=file_size
        )
        db.add(csv_upload)
        db.commit()
        db.refresh(csv_upload)
        
        # Read and process CSV file
        df = pd.read_csv(file_path)
        
        # Rename columns based on mapping
        mapped_df = df.rename(columns=columns_mapping)
        
        # Filter to only include columns we care about
        valid_columns = [
            'date', 'time','total_amount', 'quantity', 'item_name', 'category',
            'transaction_id', 'price', 'payment_method', 'customer_id', 'staff_id', 'notes'
        ]
        
        # Create a new dataframe with only the valid columns
        processed_df = pd.DataFrame()
        
        for col in valid_columns:
            if col in mapped_df.columns:
                processed_df[col] = mapped_df[col]
        
        # Convert date column to datetime with flexible parsing
        if 'date' in processed_df.columns:
            try:
                # Try common date formats in order of preference
                date_formats = [
                    "%m/%d/%Y",    # MM/DD/YYYY
                    "%d/%m/%Y",    # DD/MM/YYYY
                    "%Y-%m-%d",    # YYYY-MM-DD
                    "%m-%d-%Y",    # MM-DD-YYYY
                    "%d-%m-%Y",    # DD-MM-YYYY
                    "%m/%d/%y",    # MM/DD/YY
                    "%d/%m/%y",    # DD/MM/YY
                ]
                
                for fmt in date_formats:
                    try:
                        processed_df['date'] = pd.to_datetime(processed_df['date'], format=fmt)
                        print(f"Successfully parsed dates using format: {fmt}")
                        break
                    except ValueError:
                        continue
                else:
                    processed_df['date'] = pd.to_datetime(processed_df['date'], errors='coerce')
                    print("Used pandas' flexible date parsing")
                    
            except Exception as e:
                print(f"Error parsing dates: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error parsing dates: {str(e)}. Please ensure your date column contains valid dates.")
        
        if 'time' in processed_df.columns:
            try:
                time_formats = [
                    "%H:%M:%S",    # HH:MM:SS
                    "%H:%M",       # HH:MM
                    "%I:%M %p",    # HH:MM AM/PM
                    "%I:%M:%S %p", # HH:MM:SS AM/PM
                ]
                
                for fmt in time_formats:
                    try:
                        processed_df['time'] = pd.to_datetime(processed_df['time'], format=fmt).dt.time
                        print(f"Successfully parsed times using format: {fmt}")
                        break
                    except ValueError:
                        continue
                else:
                    processed_df['time'] = pd.to_datetime(processed_df['time'], errors='coerce').dt.time
                    print("Used pandas' flexible time parsing")
                    
            except Exception as e:
                print(f"Error parsing times: {str(e)}")
                
        # Convert numeric columns
        if 'price' in processed_df.columns:
            processed_df['price'] = pd.to_numeric(processed_df['price'], errors='coerce')
        
        if 'quantity' in processed_df.columns:
            processed_df['quantity'] = pd.to_numeric(processed_df['quantity'], errors='coerce')
        
        # Calculate total_amount if not provided
        if 'total_amount' not in processed_df.columns and 'price' in processed_df.columns:
            if 'quantity' in processed_df.columns:
                processed_df['total_amount'] = processed_df['price'] * processed_df['quantity']
            else:
                processed_df['total_amount'] = processed_df['price']
        elif 'total_amount' in processed_df.columns:
            processed_df['total_amount'] = pd.to_numeric(processed_df['total_amount'], errors='coerce')
        
        # Create sales records
        sales_records = []
        for _, row in processed_df.iterrows():
            # Skip rows with missing required data (only date is required)
            if pd.isna(row.get('date')):
                continue
                
            # Calculate price if not provided
            price = row.get('price')
            total_amount = row.get('total_amount')
            quantity = row.get('quantity', 1)
            
            # If total_amount is missing but price is available, use price as total_amount
            if pd.isna(total_amount) and not pd.isna(price):
                total_amount = price
            # If price is missing but total_amount is available, use total_amount as price
            elif pd.isna(price) and not pd.isna(total_amount):
                price = total_amount
            # If both are missing, skip this row
            elif pd.isna(price) and pd.isna(total_amount):
                continue
                
            sales_record = SalesData(
                restaurant_id=restaurant_id,
                date=row.get('date'),
                time=row.get('time'),
                total_amount=total_amount,
                quantity=int(quantity) if not pd.isna(quantity) else 1,
                item_name=row.get('item_name', ''),
                category=row.get('category', ''),
                transaction_id=row.get('transaction_id', ''),
                price=price,
                payment_method=row.get('payment_method', ''),
                customer_id=row.get('customer_id', ''),
                staff_id=row.get('staff_id', ''),
                notes=row.get('notes', '')
            )
            sales_records.append(sales_record)
        
        # Bulk insert sales records in batches for better performance
        if sales_records:
            batch_size = 1000  # Process in batches of 1000 records
            for i in range(0, len(sales_records), batch_size):
                batch = sales_records[i:i+batch_size]
                db.bulk_insert_mappings(SalesData, [record.__dict__ for record in batch])
                db.commit()  # Commit each batch
                print(f"Processed batch {i//batch_size + 1}, records {i+1}-{min(i+batch_size, len(sales_records))}")
        
        # Update CSV upload status
        csv_upload.processed = True
        csv_upload.records_processed = len(sales_records)
        db.commit()
        
        return csv_upload
        
    except Exception as e:
        # Update CSV upload status to failed
        if 'csv_upload' in locals():
            csv_upload.processed = False
            csv_upload.error_message = str(e)
            db.commit()
        
        raise e
    
# In services/sales.py, update the get_sales_analytics function
def get_sales_analytics(db: Session, restaurant_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    query = db.query(SalesData).filter(SalesData.restaurant_id == restaurant_id)
    
    if not start_date and not end_date:
        print("No date range provided, fetching all data")
    else:
        if start_date:
            query = query.filter(SalesData.date >= start_date)
        if end_date:
            query = query.filter(SalesData.date <= end_date)
    
    sales_data = query.all()
    print(f"Found {len(sales_data)} sales records")
    
    if not sales_data:
        print("No sales data found, returning default values")
        return {
            "summary": {
                "total_revenue": 0,
                "total_transactions": 0,
                "avg_transaction_value": 0
            },
            "daily_sales": [],
            "top_items": [],
            "sales_by_category": {},
            "sales_by_payment_method": {},
            "sales_by_day_of_week": {},
            "sales_by_hour": {},
            "anomalies": [],
            "insights": ["Upload sales data to see insights and analytics"]
        }
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame([{
        "date": s.date,
        "time": s.time,
        "item_name": s.item_name,
        "category": s.category,
        "quantity": s.quantity,
        "price": s.price,
        "total_amount": s.total_amount,
        "payment_method": s.payment_method
    } for s in sales_data])
    
    print(f"Data date range: {df['date'].min()} to {df['date'].max()}")
    
    total_revenue = df["total_amount"].sum()
    total_transactions = len(df)
    average_transaction_value = total_revenue / total_transactions if total_transactions > 0 else 0
    
    df['date_only'] = df['date'].dt.date
    daily_sales = df.groupby('date_only').agg({
        'total_amount': 'sum',
        'date': 'count'  
    }).rename(columns={'date': 'transactions'}).reset_index()
    daily_sales = daily_sales.rename(columns={'date_only': 'date'})
    daily_sales['date'] = daily_sales['date'].astype(str)
    daily_sales = daily_sales.to_dict('records')
    
    # Fix for top_items - include revenue and convert to regular Python types
    top_items_df = df.groupby("item_name").agg({
        'quantity': 'sum',
        'total_amount': 'sum'
    }).sort_values('total_amount', ascending=False).head(10)
    
    top_items = [
        {
            "item_name": item, 
            "total_quantity": int(row['quantity']),
            "total_revenue": float(row['total_amount'])
        } 
        for item, row in top_items_df.iterrows()
    ]
    
    # Keep sales_by_category as a dictionary for the Pydantic model
    sales_by_category = df.groupby("category")["total_amount"].sum().to_dict()
    
    sales_by_payment_method = df.groupby("payment_method")["total_amount"].sum().to_dict()
    
    df["day_of_week"] = df["date"].dt.day_name()
    sales_by_day_of_week = df.groupby("day_of_week")["total_amount"].sum().to_dict()
    
    # Keep sales_by_hour as a dictionary for the Pydantic model
    df["hour"] = df["date"].dt.hour  
    
    if 'time' in df.columns and not df['time'].isna().all():
        # Create a combined datetime with the time from the time column
        df['combined_datetime'] = df.apply(
            lambda row: datetime.combine(row['date'].date(), row['time']) if pd.notna(row['time']) else row['date'],
            axis=1
        )
        df["hour"] = df["combined_datetime"].dt.hour
    
    # Group by hour and calculate both revenue and transaction count
    hourly_data = df.groupby("hour").agg({
        'total_amount': 'sum',
        'date': 'count'  # Count of records as proxy for transactions
    }).rename(columns={'date': 'transactions'})
    
    # Create dictionary for sales_by_hour
    sales_by_hour = {}
    for hour in range(24):
        if hour in hourly_data.index:
            sales_by_hour[str(hour)] = {
                'total_revenue': float(hourly_data.loc[hour, 'total_amount']),
                'transaction_count': int(hourly_data.loc[hour, 'transactions'])
            }
        else:
            sales_by_hour[str(hour)] = {
                'total_revenue': 0.0,
                'transaction_count': 0
            }
    
    result = {
        "summary": {
            "total_revenue": float(total_revenue),
            "total_transactions": int(total_transactions),
            "avg_transaction_value": float(average_transaction_value)
        },
        "daily_sales": daily_sales,
        "top_items": top_items,
        "sales_by_category": sales_by_category,  # Keep as dictionary
        "sales_by_payment_method": sales_by_payment_method,
        "sales_by_day_of_week": sales_by_day_of_week,
        "sales_by_hour": sales_by_hour,  # Keep as dictionary
        "anomalies": [],  
        "insights": []    
    }
    
    print(f"Returning analytics data with {len(daily_sales)} daily sales records")
    return result