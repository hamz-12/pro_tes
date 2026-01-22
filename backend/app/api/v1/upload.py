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
from ...utils.csv_processor import get_csv_columns, save_uploaded_file
from ...api.deps import get_current_active_user

router = APIRouter()

@router.post("/preview-columns")
async def preview_columns(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Save file temporarily
    temp_file_path = os.path.join(settings.UPLOAD_DIR, f"temp_{file.filename}")
    file_content = await file.read()
    save_uploaded_file(file_content, f"temp_{file.filename}", settings.UPLOAD_DIR)
    
    try:
        # Get column names
        columns = get_csv_columns(temp_file_path)
        return {"columns": columns}
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/csv", response_model=CSVUploadSchema)
async def upload_csv_file(
    file: UploadFile = File(...),
    restaurant_id: int = Form(...),
    columns_mapping: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Check if restaurant belongs to current user
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Parse columns mapping
    try:
        columns_mapping_dict = json.loads(columns_mapping)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid columns mapping format")
    
    # Save file
    file_content = await file.read()
    file_path = save_uploaded_file(file_content, file.filename, settings.UPLOAD_DIR)
    
    # Process CSV
    try:
        csv_upload = upload_csv(
            db=db,
            restaurant_id=restaurant_id,
            file_path=file_path,
            filename=file.filename,
            columns_mapping=columns_mapping_dict
        )
        return csv_upload
    except Exception as e:
        # Clean up file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")