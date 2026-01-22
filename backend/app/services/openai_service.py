import openai
import json
from typing import List, Dict, Any
from ..core.config import settings

openai.api_key = settings.OPENAI_API_KEY

def detect_anomalies(sales_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Use OpenAI to detect anomalies in sales data
    """
    prompt = f"""
    Analyze the following restaurant sales data and identify any unusual patterns or outliers:
    
    Total Revenue: ${sales_data.get('total_revenue', 0):.2f}
    Total Transactions: {sales_data.get('total_transactions', 0)}
    Average Transaction Value: ${sales_data.get('average_transaction_value', 0):.2f}
    
    Top Selling Items: {json.dumps(sales_data.get('top_selling_items', []))}
    Sales by Category: {json.dumps(sales_data.get('sales_by_category', {}))}
    Sales by Payment Method: {json.dumps(sales_data.get('sales_by_payment_method', {}))}
    Sales by Day of Week: {json.dumps(sales_data.get('sales_by_day_of_week', {}))}
    Sales by Hour: {json.dumps(sales_data.get('sales_by_hour', {}))}
    
    Please identify any anomalies or unusual patterns in the data. For each anomaly, provide:
    1. A description of the anomaly
    2. The potential impact on the business
    3. Possible explanations
    
    Format your response as a JSON array of objects with the following structure:
    [
        {{
            "description": "Description of the anomaly",
            "impact": "Potential impact on the business",
            "explanation": "Possible explanations"
        }}
    ]
    """
    
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=1000,
            temperature=0.3
        )
        
        anomalies_text = response.choices[0].text.strip()
        
        # Try to parse the response as JSON
        try:
            anomalies = json.loads(anomalies_text)
            return anomalies
        except json.JSONDecodeError:
            # If parsing fails, return a default anomaly
            return [{
                "description": "Unable to analyze anomalies with AI",
                "impact": "Unknown",
                "explanation": "AI service returned unparseable response"
            }]
    except Exception as e:
        # If there's an error with the OpenAI API, return a default anomaly
        return [{
            "description": f"Error analyzing anomalies: {str(e)}",
            "impact": "Unknown",
            "explanation": "AI service error"
        }]

def generate_insights(sales_data: Dict[str, Any]) -> List[str]:
    """
    Use OpenAI to generate insights from sales data
    """
    prompt = f"""
    Analyze the following restaurant sales data and provide 3-5 actionable insights:
    
    Total Revenue: ${sales_data.get('total_revenue', 0):.2f}
    Total Transactions: {sales_data.get('total_transactions', 0)}
    Average Transaction Value: ${sales_data.get('average_transaction_value', 0):.2f}
    
    Top Selling Items: {json.dumps(sales_data.get('top_selling_items', []))}
    Sales by Category: {json.dumps(sales_data.get('sales_by_category', {}))}
    Sales by Payment Method: {json.dumps(sales_data.get('sales_by_payment_method', {}))}
    Sales by Day of Week: {json.dumps(sales_data.get('sales_by_day_of_week', {}))}
    Sales by Hour: {json.dumps(sales_data.get('sales_by_hour', {}))}
    
    Please provide 3-5 actionable insights that could help the restaurant owner improve their business.
    Format your response as a JSON array of strings.
    """
    
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=800,
            temperature=0.5
        )
        
        insights_text = response.choices[0].text.strip()
        
        # Try to parse the response as JSON
        try:
            insights = json.loads(insights_text)
            return insights
        except json.JSONDecodeError:
            # If parsing fails, return a default insight
            return ["Unable to generate insights with AI at this time."]
    except Exception as e:
        # If there's an error with the OpenAI API, return a default insight
        return [f"Error generating insights: {str(e)}"]