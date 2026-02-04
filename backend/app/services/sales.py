# services/sales.py
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
        
        # Filter to only include columns we care about - UPDATED WITH NEW COLUMNS
        valid_columns = [
            'date', 'time', 'total_amount', 'quantity', 'item_name', 'category',
            'transaction_id', 'price', 'payment_method', 'customer_id', 'staff_id', 'notes',
            'purchase_type', 'manager', 'city'  # NEW COLUMNS
        ]
        
        # Create a new dataframe with only the valid columns
        processed_df = pd.DataFrame()
        
        for col in valid_columns:
            if col in mapped_df.columns:
                processed_df[col] = mapped_df[col]
        
        # Convert date column to datetime with flexible parsing
        if 'date' in processed_df.columns:
            try:
                date_formats = [
                    "%m/%d/%Y",
                    "%d/%m/%Y",
                    "%Y-%m-%d",
                    "%m-%d-%Y",
                    "%d-%m-%Y",
                    "%m/%d/%y",
                    "%d/%m/%y",
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
                raise Exception(f"Error parsing dates: {str(e)}. Please ensure your date column contains valid dates.")
        
        if 'time' in processed_df.columns:
            try:
                time_formats = [
                    "%H:%M:%S",
                    "%H:%M",
                    "%I:%M %p",
                    "%I:%M:%S %p",
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
        
        # Clean and standardize new columns
        if 'purchase_type' in processed_df.columns:
            processed_df['purchase_type'] = processed_df['purchase_type'].fillna('Unknown').astype(str).str.strip()
            # Standardize common variations
            purchase_type_mapping = {
                'drive-thru': 'Drive-thru',
                'drive thru': 'Drive-thru',
                'drivethru': 'Drive-thru',
                'online': 'Online',
                'in-store': 'In-store',
                'in store': 'In-store',
                'instore': 'In-store',
                'store': 'In-store',
            }
            processed_df['purchase_type'] = processed_df['purchase_type'].str.lower().map(
                lambda x: purchase_type_mapping.get(x, x.title())
            )
        
        if 'manager' in processed_df.columns:
            processed_df['manager'] = processed_df['manager'].fillna('Unknown').astype(str).str.strip().str.title()
        
        if 'city' in processed_df.columns:
            processed_df['city'] = processed_df['city'].fillna('Unknown').astype(str).str.strip().str.title()
        
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
            
            if pd.isna(total_amount) and not pd.isna(price):
                total_amount = price
            elif pd.isna(price) and not pd.isna(total_amount):
                price = total_amount
            elif pd.isna(price) and pd.isna(total_amount):
                continue
                
            sales_record = SalesData(
                restaurant_id=restaurant_id,
                date=row.get('date'),
                time=row.get('time'),
                total_amount=total_amount,
                quantity=int(quantity) if not pd.isna(quantity) else 1,
                item_name=row.get('item_name', 'Unknown Item'),
                category=row.get('category', ''),
                transaction_id=row.get('transaction_id', ''),
                price=price,
                payment_method=row.get('payment_method', ''),
                customer_id=row.get('customer_id', ''),
                staff_id=row.get('staff_id', ''),
                notes=row.get('notes', ''),
                # NEW FIELDS
                purchase_type=row.get('purchase_type', ''),
                manager=row.get('manager', ''),
                city=row.get('city', '')
            )
            sales_records.append(sales_record)
        
        # Bulk insert sales records in batches
        if sales_records:
            batch_size = 1000
            for i in range(0, len(sales_records), batch_size):
                batch = sales_records[i:i+batch_size]
                db.bulk_insert_mappings(SalesData, [
                    {k: v for k, v in record.__dict__.items() if not k.startswith('_')} 
                    for record in batch
                ])
                db.commit()
                print(f"Processed batch {i//batch_size + 1}, records {i+1}-{min(i+batch_size, len(sales_records))}")
        
        # Update CSV upload status
        csv_upload.processed = True
        csv_upload.records_processed = len(sales_records)
        db.commit()
        
        return csv_upload
        
    except Exception as e:
        if 'csv_upload' in locals():
            csv_upload.processed = False
            csv_upload.error_message = str(e)
            db.commit()
        
        raise e


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
    
    # Default empty response
    empty_response = {
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
        "sales_by_purchase_type": {},
        "sales_by_manager": {},
        "sales_by_city": {},
        "anomalies": [],
        "insights": ["Upload sales data to see insights and analytics"]
    }
    
    if not sales_data:
        print("No sales data found, returning default values")
        return empty_response
    
    # Convert to DataFrame for easier analysis - UPDATED WITH NEW COLUMNS
    df = pd.DataFrame([{
        "date": s.date,
        "time": s.time,
        "item_name": s.item_name,
        "category": s.category,
        "quantity": s.quantity,
        "price": s.price,
        "total_amount": s.total_amount,
        "payment_method": s.payment_method,
        "purchase_type": s.purchase_type or 'Unknown',
        "manager": s.manager or 'Unknown',
        "city": s.city or 'Unknown'
    } for s in sales_data])
    
    print(f"Data date range: {df['date'].min()} to {df['date'].max()}")
    
    # Summary calculations
    total_revenue = df["total_amount"].sum()
    total_transactions = len(df)
    average_transaction_value = total_revenue / total_transactions if total_transactions > 0 else 0
    
    # Daily sales
    df['date_only'] = df['date'].dt.date
    daily_sales = df.groupby('date_only').agg({
        'total_amount': 'sum',
        'date': 'count'  
    }).rename(columns={'date': 'transactions'}).reset_index()
    daily_sales = daily_sales.rename(columns={'date_only': 'date'})
    daily_sales['date'] = daily_sales['date'].astype(str)
    daily_sales = daily_sales.to_dict('records')
    
    # Top items
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
    
    # Sales by category
    sales_by_category = df.groupby("category")["total_amount"].sum().to_dict()
    
    # Sales by payment method - ENHANCED
    payment_method_stats = df.groupby("payment_method").agg({
        'total_amount': 'sum',
        'date': 'count'
    }).rename(columns={'date': 'transaction_count'})
    
    sales_by_payment_method = {}
    for method, row in payment_method_stats.iterrows():
        method_name = method if method else 'Unknown'
        sales_by_payment_method[method_name] = {
            'total_revenue': float(row['total_amount']),
            'transaction_count': int(row['transaction_count']),
            'percentage': float(row['total_amount'] / total_revenue * 100) if total_revenue > 0 else 0
        }
    
    # Sales by day of week
    df["day_of_week"] = df["date"].dt.day_name()
    sales_by_day_of_week = df.groupby("day_of_week")["total_amount"].sum().to_dict()
    
    # Sales by hour
    df["hour"] = df["date"].dt.hour  
    
    if 'time' in df.columns and not df['time'].isna().all():
        df['combined_datetime'] = df.apply(
            lambda row: datetime.combine(row['date'].date(), row['time']) if pd.notna(row['time']) else row['date'],
            axis=1
        )
        df["hour"] = df["combined_datetime"].dt.hour
    
    hourly_data = df.groupby("hour").agg({
        'total_amount': 'sum',
        'date': 'count'
    }).rename(columns={'date': 'transactions'})
    
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
    
    # NEW: Sales by Purchase Type
    purchase_type_stats = df.groupby("purchase_type").agg({
        'total_amount': 'sum',
        'date': 'count',
        'quantity': 'sum'
    }).rename(columns={'date': 'transaction_count', 'quantity': 'total_items'})
    
    sales_by_purchase_type = {}
    for ptype, row in purchase_type_stats.iterrows():
        ptype_name = ptype if ptype and ptype != '' else 'Unknown'
        sales_by_purchase_type[ptype_name] = {
            'total_revenue': float(row['total_amount']),
            'transaction_count': int(row['transaction_count']),
            'total_items': int(row['total_items']),
            'percentage': float(row['total_amount'] / total_revenue * 100) if total_revenue > 0 else 0,
            'avg_order_value': float(row['total_amount'] / row['transaction_count']) if row['transaction_count'] > 0 else 0
        }
    
    # NEW: Sales by Manager
    manager_stats = df.groupby("manager").agg({
        'total_amount': 'sum',
        'date': 'count',
        'quantity': 'sum'
    }).rename(columns={'date': 'transaction_count', 'quantity': 'total_items'})
    
    # Calculate additional manager metrics
    sales_by_manager = {}
    for manager, row in manager_stats.iterrows():
        manager_name = manager if manager and manager != '' else 'Unknown'
        manager_transactions = df[df['manager'] == manager]
        
        # Get manager's busiest hour
        manager_hourly = manager_transactions.groupby(manager_transactions['date'].dt.hour)['total_amount'].sum()
        busiest_hour = int(manager_hourly.idxmax()) if len(manager_hourly) > 0 else 0
        
        # Get manager's top selling item
        manager_items = manager_transactions.groupby('item_name')['quantity'].sum()
        top_item = manager_items.idxmax() if len(manager_items) > 0 else 'N/A'
        
        sales_by_manager[manager_name] = {
            'total_revenue': float(row['total_amount']),
            'transaction_count': int(row['transaction_count']),
            'total_items': int(row['total_items']),
            'percentage': float(row['total_amount'] / total_revenue * 100) if total_revenue > 0 else 0,
            'avg_order_value': float(row['total_amount'] / row['transaction_count']) if row['transaction_count'] > 0 else 0,
            'busiest_hour': busiest_hour,
            'top_item': top_item
        }
    
    # NEW: Sales by City
    city_stats = df.groupby("city").agg({
        'total_amount': 'sum',
        'date': 'count',
        'quantity': 'sum'
    }).rename(columns={'date': 'transaction_count', 'quantity': 'total_items'})
    
    sales_by_city = {}
    for city, row in city_stats.iterrows():
        city_name = city if city and city != '' else 'Unknown'
        city_transactions = df[df['city'] == city]
        
        # Get city's preferred payment method
        city_payments = city_transactions.groupby('payment_method')['total_amount'].sum()
        preferred_payment = city_payments.idxmax() if len(city_payments) > 0 else 'N/A'
        
        # Get city's preferred purchase type
        city_purchase_types = city_transactions.groupby('purchase_type')['total_amount'].sum()
        preferred_purchase_type = city_purchase_types.idxmax() if len(city_purchase_types) > 0 else 'N/A'
        
        sales_by_city[city_name] = {
            'total_revenue': float(row['total_amount']),
            'transaction_count': int(row['transaction_count']),
            'total_items': int(row['total_items']),
            'percentage': float(row['total_amount'] / total_revenue * 100) if total_revenue > 0 else 0,
            'avg_order_value': float(row['total_amount'] / row['transaction_count']) if row['transaction_count'] > 0 else 0,
            'preferred_payment': preferred_payment,
            'preferred_purchase_type': preferred_purchase_type
        }
    
    print('Sales by purchase type:', sales_by_purchase_type)
    print('Sales by manager:', sales_by_manager)
    print('Sales by city:', sales_by_city)
    
    result = {
        "summary": {
            "total_revenue": float(total_revenue),
            "total_transactions": int(total_transactions),
            "avg_transaction_value": float(average_transaction_value)
        },
        "daily_sales": daily_sales,
        "top_items": top_items,
        "sales_by_category": sales_by_category,
        "sales_by_payment_method": sales_by_payment_method,
        "sales_by_day_of_week": sales_by_day_of_week,
        "sales_by_hour": sales_by_hour,
        "sales_by_purchase_type": sales_by_purchase_type,
        "sales_by_manager": sales_by_manager,
        "sales_by_city": sales_by_city,
        "anomalies": [],
        "insights": []
    }
    
    print(f"Returning analytics data with {len(daily_sales)} daily sales records")
    return result