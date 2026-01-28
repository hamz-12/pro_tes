from typing import List, Dict, Any
from ..schemas.sales import SalesDataCreate

def validate_sales_data(sales_data_list: List[SalesDataCreate]) -> List[SalesDataCreate]:
    validated_data = []
    
    for sales_data in sales_data_list:
        # Check if required fields are present and valid
        if not sales_data.item_name or sales_data.price <= 0:
            continue
            
        # Ensure total_amount is calculated correctly
        if sales_data.total_amount <= 0:
            sales_data.total_amount = sales_data.price * sales_data.quantity
            
        validated_data.append(sales_data)
    
    return validated_data