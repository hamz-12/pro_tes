# api/v1/upload.py
import os
import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.config import settings
from ...models.user import User
from ...models.restaurant import Restaurant
from ...schemas.sales import ColumnMapping, CSVUpload as CSVUploadSchema
from ...services.sales import upload_csv
from ...services.llm_services import map_csv_columns
from ...utils.csv_processor import get_csv_columns, save_uploaded_file
from ...api.deps import get_current_active_user

router = APIRouter()

@router.post("/preview-columns")
async def preview_columns(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    print(f"Previewing columns for file: {file.filename}")
    if not file.filename.endswith('.csv'):
        print("File is not a CSV")
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Save file temporarily
    temp_file_path = os.path.join(settings.UPLOAD_DIR, f"temp_{file.filename}")
    print(f"Saving file temporarily to: {temp_file_path}")
    file_content = await file.read()
    save_uploaded_file(file_content, f"temp_{file.filename}", settings.UPLOAD_DIR)
    
    try:
        # Get column names
        columns = get_csv_columns(temp_file_path)
        print(f"Found columns: {columns}")
        
        # Use AI to map columns
        column_mapping = map_csv_columns(columns)
        print(f"Suggested mapping: {column_mapping}")
        
        response = {"columns": columns, "suggested_mapping": column_mapping}
        print(f"Returning response: {response}")
        return response
    except Exception as e:
        print(f"Error previewing columns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error previewing CSV columns: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Cleaned up temp file: {temp_file_path}")

@router.post("/csv", response_model=CSVUploadSchema)
async def upload_csv_file(
    file: UploadFile = File(...),
    restaurant_id: int = Form(...),
    columns_mapping: str = Form(...),
    use_ai_mapping: bool = Form(False),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"Uploading CSV file: {file.filename} for restaurant: {restaurant_id}")
    if not file.filename.endswith('.csv'):
        print("File is not a CSV")
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Check if restaurant belongs to current user
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        print(f"Restaurant with ID {restaurant_id} not found for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Parse columns mapping
    try:
        columns_mapping_dict = json.loads(columns_mapping)
        print(f"Parsed column mapping: {columns_mapping_dict}")
    except json.JSONDecodeError:
        print("Invalid columns mapping format")
        raise HTTPException(status_code=400, detail="Invalid columns mapping format")
    
    # If user wants AI mapping, override with AI suggestions
    if use_ai_mapping:
        print("Using AI mapping")
        # Save file temporarily to get columns
        temp_file_path = os.path.join(settings.UPLOAD_DIR, f"temp_{file.filename}")
        file_content = await file.read()
        save_uploaded_file(file_content, f"temp_{file.filename}", settings.UPLOAD_DIR)
        
        try:
            # Get column names and use AI to map them
            columns = get_csv_columns(temp_file_path)
            ai_mapping = map_csv_columns(columns)
            print(f"AI mapping: {ai_mapping}")
            
            # Use AI mapping for any columns not explicitly mapped by user
            for col, field in ai_mapping.items():
                if col not in columns_mapping_dict:
                    columns_mapping_dict[col] = field
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    
    # Save file
    file_content = await file.read()
    file_path = save_uploaded_file(file_content, file.filename, settings.UPLOAD_DIR)
    print(f"Saved file to: {file_path}")
    
    # Get file size for progress tracking
    file_size = os.path.getsize(file_path)
    print(f"File size: {file_size} bytes")
    
    # Process CSV
    try:
        csv_upload = upload_csv(
            db=db,
            restaurant_id=restaurant_id,
            file_path=file_path,
            filename=file.filename,
            columns_mapping=columns_mapping_dict
        )
        print(f"Processed CSV upload: {csv_upload}")
        
        # Refresh the object to ensure all fields are loaded
        db.refresh(csv_upload)
        
        # Return the CSV upload object - it should match the schema
        return csv_upload
    except Exception as e:
        print(f"Error processing CSV: {str(e)}")
        # Clean up file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")