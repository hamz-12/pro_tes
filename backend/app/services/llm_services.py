# services/llm_services.py
import json
import re
from typing import List, Dict, Any, Optional
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from langchain_core.prompts import PromptTemplate
from ..core.config import settings
import os

llm = HuggingFaceEndpoint(
    repo_id="Qwen/Qwen2.5-7B-Instruct",
    max_new_tokens=1000,
    temperature=0.1,
    huggingfacehub_api_token=settings.HUGGINGFACE_API_TOKEN
)

model = ChatHuggingFace(llm=llm)


def detect_anomalies(sales_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Analyze sales data and identify unusual patterns or outliers.
    Updated to include purchase_type, manager, and city analytics.
    """
    template = """
    Analyze the following restaurant sales data and identify any unusual patterns or outliers:
    
    Data:
    - Total Revenue: ${revenue:.2f}
    - Total Transactions: {transactions}
    - Average Transaction Value: ${avg_value:.2f}
    - Top Selling Items: {top_items}
    - Sales by Day of Week: {days}
    - Sales by Purchase Type (Drive-thru/Online/In-store): {purchase_types}
    - Sales by Payment Method: {payment_methods}
    - Manager Performance: {managers}
    - Sales by City/Location: {cities}

    Identify anomalies such as:
    - Significant revenue drops or spikes
    - Unusual patterns in purchase channels
    - Manager performance outliers
    - Location-based discrepancies
    - Payment method irregularities
    - Day-of-week anomalies
    
    Return ONLY a valid JSON array of objects. Do not include introductory text.
    Structure:
    [
        {{
            "description": "string describing the anomaly",
            "impact": "string describing business impact (e.g., 'High', 'Medium', 'Low' with context)",
            "explanation": "string with possible explanation and recommendation"
        }}
    ]
    
    Provide 3-5 most significant anomalies.
    """
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(
        revenue=sales_data.get('summary', {}).get('total_revenue', 0),
        transactions=sales_data.get('summary', {}).get('total_transactions', 0),
        avg_value=sales_data.get('summary', {}).get('avg_transaction_value', 0),
        top_items=json.dumps(sales_data.get('top_items', [])[:5]),  # Limit to top 5
        days=json.dumps(sales_data.get('sales_by_day_of_week', {})),
        purchase_types=json.dumps(sales_data.get('sales_by_purchase_type', {})),
        payment_methods=json.dumps(sales_data.get('sales_by_payment_method', {})),
        managers=json.dumps(sales_data.get('sales_by_manager', {})),
        cities=json.dumps(sales_data.get('sales_by_city', {}))
    )

    try:
        response = model.invoke(formatted_prompt)
        content = response.content
        
        clean_response = content.strip().replace("```json", "").replace("```", "")
        anomalies = json.loads(clean_response)
        
        # Add severity levels if not present
        for anomaly in anomalies:
            if 'severity' not in anomaly:
                impact = anomaly.get('impact', '').lower()
                if 'high' in impact or 'significant' in impact:
                    anomaly['severity'] = 'critical'
                elif 'medium' in impact or 'moderate' in impact:
                    anomaly['severity'] = 'warning'
                else:
                    anomaly['severity'] = 'info'
        
        return anomalies
        
    except Exception as e:
        print(f"AI anomaly detection failed: {str(e)}")
        # Return a fallback response if the model fails
        return [{
            "description": f"AI Analysis Error: {str(e)}",
            "impact": "Unknown",
            "explanation": "Failed to parse AI response. Manual review recommended.",
            "severity": "warning"
        }]


def generate_insights(sales_data: Dict[str, Any]) -> List[str]:
    """
    Generate actionable business insights from sales data.
    Updated to include purchase_type, manager, and city analytics.
    """
    template = """
    As a restaurant business consultant, analyze this data and provide 5-7 actionable insights:
    
    Summary:
    - Total Revenue: ${revenue:.2f}
    - Total Transactions: {transactions}
    - Average Order Value: ${avg_value:.2f}
    
    Top Items: {top_items}
    
    Sales by Purchase Channel:
    {purchase_types}
    
    Payment Methods:
    {payment_methods}
    
    Manager Performance:
    {managers}
    
    Location Performance:
    {cities}
    
    Sales by Day of Week:
    {days}

    Focus on:
    1. Which sales channels (Drive-thru/Online/In-store) are performing best
    2. Manager performance comparisons and recommendations
    3. Location-specific opportunities
    4. Payment method trends
    5. Peak day optimization
    6. Average order value improvement strategies
    
    Return ONLY a valid JSON array of strings with actionable insights.
    Each insight should be specific, data-driven, and actionable.
    Example: ["Insight 1 with specific recommendation", "Insight 2 with data point"]
    """
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(
        revenue=sales_data.get('summary', {}).get('total_revenue', 0),
        transactions=sales_data.get('summary', {}).get('total_transactions', 0),
        avg_value=sales_data.get('summary', {}).get('avg_transaction_value', 0),
        top_items=json.dumps(sales_data.get('top_items', [])[:5]),
        purchase_types=json.dumps(sales_data.get('sales_by_purchase_type', {})),
        payment_methods=json.dumps(sales_data.get('sales_by_payment_method', {})),
        managers=json.dumps(sales_data.get('sales_by_manager', {})),
        cities=json.dumps(sales_data.get('sales_by_city', {})),
        days=json.dumps(sales_data.get('sales_by_day_of_week', {}))
    )
    
    try:
        response = model.invoke(formatted_prompt)
        content = response.content
        clean_response = content.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_response)
    except Exception as e:
        print(f"AI insights generation failed: {str(e)}")
        # Return fallback insights based on available data
        return generate_fallback_insights(sales_data)


def generate_fallback_insights(sales_data: Dict[str, Any]) -> List[str]:
    """
    Generate basic insights when AI is unavailable.
    """
    insights = []
    
    summary = sales_data.get('summary', {})
    avg_value = summary.get('avg_transaction_value', 0)
    total_revenue = summary.get('total_revenue', 0)
    total_transactions = summary.get('total_transactions', 0)
    
    # Basic metrics insight
    if avg_value > 0:
        insights.append(f"Average order value is ${avg_value:.2f}. Consider upselling strategies to increase this metric.")
    
    # Top items insight
    top_items = sales_data.get('top_items', [])
    if top_items:
        top_item = top_items[0]
        insights.append(f"Best seller: {top_item.get('item_name', 'Unknown')} with {top_item.get('total_quantity', 0)} units sold.")
    
    # Purchase type insights
    purchase_types = sales_data.get('sales_by_purchase_type', {})
    if purchase_types:
        sorted_types = sorted(purchase_types.items(), key=lambda x: x[1].get('total_revenue', 0) if isinstance(x[1], dict) else x[1], reverse=True)
        if sorted_types:
            top_channel = sorted_types[0]
            channel_revenue = top_channel[1].get('total_revenue', 0) if isinstance(top_channel[1], dict) else top_channel[1]
            percentage = (channel_revenue / total_revenue * 100) if total_revenue > 0 else 0
            insights.append(f"Top sales channel: {top_channel[0]} generating {percentage:.1f}% of total revenue.")
    
    # Manager insights
    managers = sales_data.get('sales_by_manager', {})
    if managers and len(managers) > 1:
        sorted_managers = sorted(managers.items(), key=lambda x: x[1].get('total_revenue', 0) if isinstance(x[1], dict) else x[1], reverse=True)
        top_manager = sorted_managers[0]
        insights.append(f"Top performing manager: {top_manager[0]}. Consider sharing their best practices with the team.")
    
    # City insights
    cities = sales_data.get('sales_by_city', {})
    if cities and len(cities) > 1:
        sorted_cities = sorted(cities.items(), key=lambda x: x[1].get('total_revenue', 0) if isinstance(x[1], dict) else x[1], reverse=True)
        top_city = sorted_cities[0]
        insights.append(f"Highest revenue location: {top_city[0]}. Analyze success factors for other locations.")
    
    # Payment method insights
    payment_methods = sales_data.get('sales_by_payment_method', {})
    if payment_methods:
        sorted_payments = sorted(payment_methods.items(), key=lambda x: x[1].get('total_revenue', 0) if isinstance(x[1], dict) else x[1], reverse=True)
        if sorted_payments:
            top_payment = sorted_payments[0]
            insights.append(f"Most popular payment method: {top_payment[0]}. Ensure smooth processing for this method.")
    
    # Default insight if nothing else
    if not insights:
        insights = [
            "Upload more sales data to generate detailed insights.",
            "Focus on increasing average transaction value through upselling.",
            "Monitor peak hours to optimize staffing levels."
        ]
    
    return insights[:7]  # Limit to 7 insights


def map_csv_columns(columns: List[str]) -> Dict[str, str]:
    """
    Use AI to map CSV column names to our expected schema.
    Updated to include purchase_type, manager, and city fields.
    """
    template = """
    You are a data analyst helping to map CSV column names to a restaurant sales database schema.
    
    CSV Columns: {columns}
    
    Target Schema Fields:
    - date: Date of the transaction (required)
    - time: Time of the transaction (optional, for hourly analysis)
    - price: Price per unit (recommended)
    - quantity: Number of items sold (recommended)
    - total_amount: Total sales amount for the transaction (optional, calculated from price × quantity if not provided)
    - item_name: Name of the item sold
    - category: Category of the item (e.g., appetizer, main course, beverage)
    - transaction_id: Unique identifier for the transaction
    - payment_method: Method of payment (Cash, Credit Card, Google Pay, Apple Pay, etc.)
    - purchase_type: Type of purchase channel (Drive-thru, Online, In-store)
    - manager: Name of the manager on duty
    - city: City or location of the sale
    - customer_id: Identifier for the customer
    - staff_id: Identifier for the staff member
    - notes: Additional notes about the transaction
    
    Map each CSV column to the most appropriate target field.
    If a column doesn't match any target field, do not include it in the response.
    
    Return ONLY a valid JSON object mapping CSV column names to target field names.
    Format: {{"CSV Column Name": "target_field_name", ...}}
    
    Examples of common mappings:
    - "Order Type" or "Channel" -> "purchase_type"
    - "Manager Name" or "Shift Manager" -> "manager"
    - "City" or "Location" or "Branch" -> "city"
    - "Payment Type" or "Payment Mode" -> "payment_method"
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
        clean_response = re.sub(r'```', '', clean_response)
        
        # Parse the JSON response
        mapping = json.loads(clean_response)
        
        # Validate and clean the mapping - UPDATED WITH NEW FIELDS
        valid_fields = [
            'date', 'time', 'total_amount', 'quantity', 'item_name', 'category',
            'transaction_id', 'price', 'payment_method', 'customer_id', 'staff_id', 'notes',
            'purchase_type', 'manager', 'city'  # NEW FIELDS
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
    Fallback method using pattern matching when AI is unavailable.
    Updated to include purchase_type, manager, and city fields.
    """
    mapping = {}
    
    # Define patterns for each field (in priority order)
    field_patterns = {
        'date': ['date', 'order_date', 'transaction_date', 'sale_date', 'order date', 'transaction date', 'created_at', 'created'],
        'time': ['time', 'order_time', 'transaction_time', 'sale_time', 'hour', 'timestamp'],
        'price': ['price', 'unit_price', 'item_price', 'cost', 'unit price', 'unit_cost', 'rate'],
        'quantity': ['quantity', 'qty', 'count', 'units', 'number', 'no_of_items', 'items', 'amount_sold'],
        'total_amount': ['total', 'total_amount', 'total_price', 'grand_total', 'subtotal', 'net_amount', 'total amount', 'total_sales', 'sales_amount', 'revenue'],
        'item_name': ['item', 'item_name', 'product', 'product_name', 'menu_item', 'item name', 'product name', 'menu item', 'description', 'item_description'],
        'category': ['category', 'item_category', 'product_category', 'food_category', 'menu_category', 'item_type'],
        'transaction_id': ['transaction_id', 'order_id', 'invoice', 'receipt', 'bill_no', 'transaction id', 'order id', 'invoice_no', 'trx_id', 'txn_id', 'id'],
        'payment_method': ['payment', 'payment_method', 'payment_type', 'pay_method', 'payment method', 'pay_type', 'mode_of_payment', 'payment_mode'],
        'customer_id': ['customer_id', 'customer', 'client_id', 'customer id', 'client', 'cust_id', 'buyer_id'],
        'staff_id': ['staff_id', 'employee_id', 'server_id', 'staff', 'employee', 'server', 'waiter', 'cashier', 'emp_id'],
        'notes': ['notes', 'comments', 'remarks', 'description', 'memo', 'note'],
        # NEW FIELD PATTERNS
        'purchase_type': [
            'purchase_type', 'purchase type', 'order_type', 'order type',
            'channel', 'sales_channel', 'sales channel', 'transaction_type',
            'service_type', 'service type', 'type_of_order', 'ordering_method',
            'order_channel', 'delivery_type', 'fulfillment_type', 'service_mode'
        ],
        'manager': [
            'manager', 'manager_name', 'manager name', 'shift_manager',
            'shift manager', 'supervisor', 'store_manager', 'team_lead',
            'in_charge', 'duty_manager', 'floor_manager', 'mgr', 'mgr_name'
        ],
        'city': [
            'city', 'city_name', 'location', 'store_location', 'branch',
            'branch_name', 'outlet', 'store_city', 'town', 'area',
            'region', 'store_name', 'restaurant_location', 'site', 'venue'
        ]
    }
    
    # Track which fields have been mapped to avoid duplicates
    mapped_fields = set()
    
    for col in columns:
        col_lower = col.lower().strip().replace(' ', '_').replace('-', '_')
        
        for field, patterns in field_patterns.items():
            if field in mapped_fields:
                continue
                
            for pattern in patterns:
                pattern_normalized = pattern.lower().replace(' ', '_').replace('-', '_')
                
                # Exact match
                if col_lower == pattern_normalized:
                    mapping[col] = field
                    mapped_fields.add(field)
                    break
                
                # Partial match (pattern contained in column name)
                if pattern_normalized in col_lower:
                    mapping[col] = field
                    mapped_fields.add(field)
                    break
                
                # Reverse partial match (column name contained in pattern)
                if len(col_lower) >= 3 and col_lower in pattern_normalized:
                    mapping[col] = field
                    mapped_fields.add(field)
                    break
            
            if field in mapped_fields:
                break
    
    return mapping


def analyze_manager_performance(sales_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze manager performance and generate recommendations.
    """
    template = """
    Analyze the following manager performance data and provide insights:
    
    Manager Data: {manager_data}
    
    For each manager, identify:
    1. Strengths
    2. Areas for improvement
    3. Specific recommendations
    
    Return ONLY a valid JSON object with manager names as keys.
    Format:
    {{
        "manager_name": {{
            "strengths": ["strength1", "strength2"],
            "improvements": ["area1", "area2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "performance_score": 0-100
        }}
    }}
    """
    
    manager_data = sales_data.get('sales_by_manager', {})
    
    if not manager_data:
        return {}
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(manager_data=json.dumps(manager_data))
    
    try:
        response = model.invoke(formatted_prompt)
        content = response.content
        clean_response = content.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_response)
    except Exception as e:
        print(f"Manager analysis failed: {str(e)}")
        return {}


def analyze_location_performance(sales_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze location/city performance and generate recommendations.
    """
    template = """
    Analyze the following location performance data and provide insights:
    
    Location Data: {city_data}
    
    For each location, identify:
    1. Performance ranking
    2. Key metrics comparison
    3. Improvement opportunities
    
    Return ONLY a valid JSON object.
    Format:
    {{
        "rankings": ["city1", "city2", ...],
        "insights": {{
            "city_name": {{
                "performance": "high/medium/low",
                "opportunities": ["opportunity1", "opportunity2"]
            }}
        }},
        "recommendations": ["recommendation1", "recommendation2"]
    }}
    """
    
    city_data = sales_data.get('sales_by_city', {})
    
    if not city_data:
        return {}
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(city_data=json.dumps(city_data))
    
    try:
        response = model.invoke(formatted_prompt)
        content = response.content
        clean_response = content.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_response)
    except Exception as e:
        print(f"Location analysis failed: {str(e)}")
        return {}


def analyze_channel_performance(sales_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze purchase channel (Drive-thru/Online/In-store) performance.
    """
    template = """
    Analyze the following sales channel performance data:
    
    Channel Data: {channel_data}
    Payment Methods: {payment_data}
    
    Provide insights on:
    1. Which channels are performing best
    2. Channel-specific recommendations
    3. Cross-channel opportunities
    4. Payment method preferences by channel
    
    Return ONLY a valid JSON object.
    Format:
    {{
        "top_channel": "channel_name",
        "channel_insights": {{
            "channel_name": {{
                "performance": "description",
                "recommendation": "specific action"
            }}
        }},
        "cross_channel_opportunities": ["opportunity1", "opportunity2"]
    }}
    """
    
    channel_data = sales_data.get('sales_by_purchase_type', {})
    payment_data = sales_data.get('sales_by_payment_method', {})
    
    if not channel_data:
        return {}
    
    prompt = PromptTemplate.from_template(template)
    formatted_prompt = prompt.format(
        channel_data=json.dumps(channel_data),
        payment_data=json.dumps(payment_data)
    )
    
    try:
        response = model.invoke(formatted_prompt)
        content = response.content
        clean_response = content.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_response)
    except Exception as e:
        print(f"Channel analysis failed: {str(e)}")
        return {}


if __name__ == "__main__":
    test_sales_data = {
        "summary": {
            "total_revenue": 15450.50,
            "total_transactions": 1016,
            "avg_transaction_value": 15.21
        },
        "top_items": [
            {"item_name": "Cheeseburger", "total_quantity": 450, "total_revenue": 4500},
            {"item_name": "Truffle Fries", "total_quantity": 320, "total_revenue": 1600},
            {"item_name": "Coke", "total_quantity": 246, "total_revenue": 738}
        ],
        "sales_by_day_of_week": {
            "Monday": 1200,
            "Tuesday": 1400,
            "Wednesday": 1600,
            "Thursday": 1800,
            "Friday": 4500,
            "Saturday": 3150,
            "Sunday": 800
        },
        "sales_by_purchase_type": {
            "Drive-thru": {
                "total_revenue": 6500,
                "transaction_count": 450,
                "percentage": 42.1,
                "avg_order_value": 14.44
            },
            "Online": {
                "total_revenue": 5200,
                "transaction_count": 320,
                "percentage": 33.7,
                "avg_order_value": 16.25
            },
            "In-store": {
                "total_revenue": 3750.50,
                "transaction_count": 246,
                "percentage": 24.2,
                "avg_order_value": 15.25
            }
        },
        "sales_by_payment_method": {
            "Credit Card": {
                "total_revenue": 7500,
                "transaction_count": 500,
                "percentage": 48.5
            },
            "Cash": {
                "total_revenue": 3000,
                "transaction_count": 250,
                "percentage": 19.4
            },
            "Google Pay": {
                "total_revenue": 2800,
                "transaction_count": 150,
                "percentage": 18.1
            },
            "Apple Pay": {
                "total_revenue": 2150.50,
                "transaction_count": 116,
                "percentage": 13.9
            }
        },
        "sales_by_manager": {
            "John Smith": {
                "total_revenue": 5500,
                "transaction_count": 380,
                "percentage": 35.6,
                "avg_order_value": 14.47,
                "busiest_hour": 12,
                "top_item": "Cheeseburger"
            },
            "Sarah Johnson": {
                "total_revenue": 6200,
                "transaction_count": 400,
                "percentage": 40.1,
                "avg_order_value": 15.50,
                "busiest_hour": 18,
                "top_item": "Truffle Fries"
            },
            "Mike Davis": {
                "total_revenue": 3750.50,
                "transaction_count": 236,
                "percentage": 24.3,
                "avg_order_value": 15.89,
                "busiest_hour": 14,
                "top_item": "Cheeseburger"
            }
        },
        "sales_by_city": {
            "New York": {
                "total_revenue": 6000,
                "transaction_count": 400,
                "percentage": 38.8,
                "avg_order_value": 15.00,
                "preferred_payment": "Credit Card",
                "preferred_purchase_type": "Online"
            },
            "Los Angeles": {
                "total_revenue": 5200,
                "transaction_count": 350,
                "percentage": 33.7,
                "avg_order_value": 14.86,
                "preferred_payment": "Apple Pay",
                "preferred_purchase_type": "Drive-thru"
            },
            "Chicago": {
                "total_revenue": 4250.50,
                "transaction_count": 266,
                "percentage": 27.5,
                "avg_order_value": 15.98,
                "preferred_payment": "Cash",
                "preferred_purchase_type": "In-store"
            }
        }
    }

    # Updated test columns with new fields
    test_columns = [
        "Trx_ID", "Sale_Date", "Sale_Time", "Item_Description", "Unit_Price", 
        "Qty_Sold", "Payment_Type", "Order_Type", "Manager_Name", "Store_City"
    ]

    print("--- STARTING LLM SERVICE TESTS ---")

    print("\n[1/4] Testing Column Mapping...")
    mapping_result = map_csv_columns(test_columns)
    print("Mapping Result:", json.dumps(mapping_result, indent=2))

    print("\n[2/4] Testing Anomaly Detection...")
    anomalies = detect_anomalies(test_sales_data)
    print("Anomalies Found:", json.dumps(anomalies, indent=2))

    print("\n[3/4] Testing Insights Generation...")
    insights = generate_insights(test_sales_data)
    print("Insights:", json.dumps(insights, indent=2))

    print("\n[4/4] Testing Fallback Column Mapping...")
    fallback_result = fallback_column_mapping(test_columns)
    print("Fallback Mapping Result:", json.dumps(fallback_result, indent=2))

    print("\n--- TESTS COMPLETE ---")