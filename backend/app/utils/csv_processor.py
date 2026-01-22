import pandas as pd
import os
from typing import List, Dict, Any
from datetime import datetime
from ..schemas.sales import SalesDataCreate

def process_csv_file(file_path: str, columns_mapping: Dict[str, Any], restaurant_id: int) -> List[SalesDataCreate]:
    df = pd.read_csv(file_path)
    
    mapped_df = pd.DataFrame()
    
    for target_col, source_col in columns_mapping.items():
        if source_col in df.columns:
            mapped_df[target_col] = df[source_col]
    
    if 'date' in mapped_df.columns:
        mapped_df['date'] = pd.to_datetime(mapped_df['date'], errors='coerce')
    
    if 'total_amount' not in mapped_df.columns and 'price' in mapped_df.columns and 'quantity' in mapped_df.columns:
        mapped_df['total_amount'] = mapped_df['price'] * mapped_df['quantity']
    
    sales_data_list = []
    for _, row in mapped_df.iterrows():
        if pd.isna(row.get('date')):
            continue
            
        sales_data = SalesDataCreate(
            restaurant_id=restaurant_id,
            transaction_id=row.get('transaction_id'),
            date=row['date'],
            item_name=row.get('item_name', ''),
            category=row.get('category'),
            quantity=int(row.get('quantity', 1)),
            price=float(row.get('price', 0)),
            total_amount=float(row.get('total_amount', row.get('price', 0) * row.get('quantity', 1))),
            payment_method=row.get('payment_method'),
            customer_id=row.get('customer_id'),
            staff_id=row.get('staff_id'),
            notes=row.get('notes')
        )
        sales_data_list.append(sales_data)
    
    return sales_data_list

def get_csv_columns(file_path: str) -> List[str]:

    df = pd.read_csv(file_path, nrows=1)
    return df.columns.tolist()

def save_uploaded_file(file_content: bytes, filename: str, upload_dir: str) -> str:

    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return file_path