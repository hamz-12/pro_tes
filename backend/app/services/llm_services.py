import json
import re
from typing import List, Dict, Any, Optional
from langchain_huggingface import HuggingFaceEndpoint,ChatHuggingFace
from langchain_core.prompts import PromptTemplate
from ..core.config import settings
import os
from dotenv import load_dotenv
load_dotenv()


token = os.getenv("HUGGINGFACE_API_TOKEN")

llm = HuggingFaceEndpoint(
    repo_id="Qwen/Qwen2.5-7B-Instruct",
    # task="text-generation",
    max_new_tokens=1000,
    temperature=0.1,
    huggingfacehub_api_token=token
)

model = ChatHuggingFace(llm=llm)

def detect_anomalies(sales_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    template = """
    Analyze the following restaurant sales data and identify any unusual patterns or outliers:
    
    Data:
    - Total Revenue: ${revenue:.2f}
    - Total Transactions: {transactions}
    - Top Selling Items: {top_items}
    - Sales by Category: {categories}
    - Sales by Day: {days}

    Identify anomalies (e.g., revenue drops, unusual payment methods, or hour spikes).
    
    Return ONLY a valid JSON array of objects. Do not include introductory text.
    Structure:
    [
        {{
            "description": "string",
            "impact": "string",
            "explanation": "string"
        }}
    ]
    """
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(
        revenue=sales_data.get('summary', {}).get('total_revenue', 0),
        transactions=sales_data.get('summary', {}).get('total_transactions', 0),
        top_items=json.dumps(sales_data.get('top_items', [])),
        categories=json.dumps(sales_data.get('sales_by_category', {})),
        days=json.dumps(sales_data.get('sales_by_day_of_week', {}))
    )

    try:
        response = model.invoke(formatted_prompt)
        content = response.content 
                
        clean_response = content.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_response)
        
    except Exception as e:
        # Return a fallback response if the model fails
        return [{
            "description": f"AI Analysis Error: {str(e)}",
            "impact": "Unknown",
            "explanation": "Switching to open-source model failed to parse response."
        }]

def generate_insights(sales_data: Dict[str, Any]) -> List[str]:
    template = """
    As a restaurant business consultant, provide 3 actionable insights for this data:
    {data_summary}

    Return ONLY a valid JSON array of strings. 
    Example: ["Insight 1", "Insight 2"]
    """
    
    data_summary = f"Revenue: {sales_data.get('summary', {}).get('total_revenue', 0)}, Items: {sales_data.get('top_items', [])}"
    
    prompt = PromptTemplate.from_template(template)
    try:
        response = model.invoke(prompt.format(data_summary=data_summary))
        content = response.content
        clean_response = content.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_response)
    except:
        # Return fallback insights if the model fails
        return ["Focus on increasing average transaction value.", "Monitor peak hour labor costs."]

def map_csv_columns(columns: List[str]) -> Dict[str, str]:
    """
    Use AI to map CSV column names to our expected schema
    """
    template = """
    You are a data analyst helping to map CSV column names to a restaurant sales database schema.
    
    CSV Columns: {columns}
    
    Target Schema Fields:
    - date: Date of the transaction (required)
    - price: Price per unit (recommended)
    - quantity: Number of items sold (recommended)
    - total_amount: Total sales amount for the transaction (optional, will be calculated from price × quantity if not provided)
    - item_name: Name of the item sold
    - category: Category of the item (e.g., appetizer, main course, beverage)
    - transaction_id: Unique identifier for the transaction
    - payment_method: Method of payment (cash, card, etc.)
    - customer_id: Identifier for the customer
    - staff_id: Identifier for the staff member
    - notes: Additional notes about the transaction
    
    Map each CSV column to the most appropriate target field.
    If a column doesn't match any target field, map it to null.
    
    Return ONLY a valid JSON object mapping CSV column names to target field names.
    Format: {{"CSV Column Name": "target_field_name", ...}}
    """
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(columns=json.dumps(columns))
    
    try:
        response = model.invoke(formatted_prompt)

        content = response.content
        
        clean_response = content.strip()
        # Remove any markdown code blocks
        clean_response = re.sub(r'```json\s*', '', clean_response)
        clean_response = re.sub(r'```\s*$', '', clean_response)
        
        # Parse the JSON response
        mapping = json.loads(clean_response)
        
        # Validate and clean the mapping
        valid_fields = [
            'date', 'total_amount', 'quantity', 'item_name', 'category',
            'transaction_id', 'price', 'payment_method', 'customer_id', 'staff_id', 'notes'
        ]
        
        # Only keep mappings to valid fields
        cleaned_mapping = {}
        for csv_col, target_field in mapping.items():
            if target_field in valid_fields:
                cleaned_mapping[csv_col] = target_field
        
        return cleaned_mapping
        
    except Exception as e:
        print(f"AI mapping failed: {str(e)}")
        # Fallback to basic pattern matching if AI fails
        return fallback_column_mapping(columns)

def fallback_column_mapping(columns: List[str]) -> Dict[str, str]:
    """
    Fallback method using pattern matching when AI is unavailable
    """
    mapping = {}
    
    for col in columns:
        col_lower = col.lower()
        
        # Date patterns
        if any(pattern in col_lower for pattern in ['date', 'time', 'day']):
            mapping[col] = 'date'
        
        # Price patterns (prioritize price over total_amount)
        elif any(pattern in col_lower for pattern in ['price', 'cost', 'unit']):
            mapping[col] = 'price'
        
        # Quantity patterns
        elif any(pattern in col_lower for pattern in ['quantity', 'qty', 'count', 'number']):
            mapping[col] = 'quantity'
        
        # Total amount patterns (only if price is not already mapped)
        elif any(pattern in col_lower for pattern in ['amount', 'total', 'sales', 'revenue']):
            if 'price' not in mapping.values():
                mapping[col] = 'total_amount'
        
        # Item name patterns
        elif any(pattern in col_lower for pattern in ['item', 'product', 'name']):
            mapping[col] = 'item_name'
        
        # Category patterns
        elif any(pattern in col_lower for pattern in ['category', 'type', 'group']):
            mapping[col] = 'category'
        
        # Transaction ID patterns
        elif any(pattern in col_lower for pattern in ['transaction', 'order', 'id']):
            mapping[col] = 'transaction_id'
        
        # Payment method patterns
        elif any(pattern in col_lower for pattern in ['payment', 'pay']):
            mapping[col] = 'payment_method'
        
        # Customer ID patterns
        elif any(pattern in col_lower for pattern in ['customer', 'client']):
            mapping[col] = 'customer_id'
        
        # Staff ID patterns
        elif any(pattern in col_lower for pattern in ['staff', 'employee', 'server']):
            mapping[col] = 'staff_id'
        
        # Notes patterns
        elif any(pattern in col_lower for pattern in ['note', 'comment', 'remark']):
            mapping[col] = 'notes'
    
    return mapping


if __name__ == "__main__":
    test_sales_data = {
        "summary": {
            "total_revenue": 15450.50,
            "total_transactions": 1016
        },
        "top_items": [
            {"name": "Cheeseburger", "sales": 450},
            {"name": "Truffle Fries", "sales": 320},
            {"name": "Coke", "sales": 246}
        ],
        "sales_by_category": {
            "Main Course": 8500,
            "Sides": 4000,
            "Beverages": 2950.50
        },
        "sales_by_day_of_week": {
            "Monday": 1200,
            "Friday": 4500,  # A clear spike
            "Sunday": 800    # A clear drop
        }
    }

    test_columns = ["Trx_ID", "Sale_Date", "Item_Description", "Unit_Price", "Qty_Sold", "Payment_Type"]

    print("--- STARTING LLM SERVICE TESTS ---")

    print("\n[1/3] Testing Column Mapping...")
    mapping_result = map_csv_columns(test_columns)
    print("Mapping Result:", json.dumps(mapping_result, indent=2))

    print("\n[2/3] Testing Anomaly Detection...")
    anomalies = detect_anomalies(test_sales_data)
    print("Anomalies Found:", json.dumps(anomalies, indent=2))

    print("\n[3/3] Testing Insights Generation...")
    insights = generate_insights(test_sales_data)
    print("Insights:", json.dumps(insights, indent=2))

    print("\n--- TESTS COMPLETE ---")