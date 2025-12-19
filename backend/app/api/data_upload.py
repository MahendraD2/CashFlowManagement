import os
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from app.api import deps
from app.models.user import User
from app.schemas.financial import UploadResponse
from app.services import data_processing
from app.services.notification_service import create_notification
from app.schemas.notification import NotificationCreate
from app.config import settings
from app.utils.excel_utils import validate_excel_structure
from app.utils.template_generator import generate_excel_template

router = APIRouter()

@router.post("/upload-excel", response_model=UploadResponse)
async def upload_excel_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload and process an Excel file
    """
    # Check if the file is an Excel file
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files (.xlsx, .xls) are allowed",
        )
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    
    # Generate a unique filename to prevent overwriting
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, unique_filename)
    
    try:
        # Save the file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Validate the Excel structure
        if not validate_excel_structure(file_path):
            # Clean up the invalid file
            if os.path.exists(file_path):
                os.remove(file_path)
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Excel file structure. Please use the correct template.",
            )
        
        # Process the file
        try:
            file_id = data_processing.process_excel_file(file_path, current_user.id)
            
            # Create a notification for the user
            notification = NotificationCreate(
                user_id=current_user.id,
                message=f"Excel file '{file.filename}' was successfully uploaded and processed.",
                status="pending"
            )
            create_notification(db=db, obj_in=notification)
            
            # Check for payment data and create notifications for due payments
            try:
                payment_data = data_processing.extract_payment_data(file_path, current_user.id)
                if payment_data and 'due_payments' in payment_data and payment_data['due_payments'] > 0:
                    due_notification = NotificationCreate(
                        user_id=current_user.id,
                        message=f"You have {payment_data['due_payments']} payments that are due. Please review them.",
                        status="due"
                    )
                    create_notification(db=db, obj_in=due_notification)
            except Exception as e:
                # Log the error but don't fail the upload
                print(f"Error creating payment notifications: {str(e)}")
            
            return {
                "success": True,
                "message": "File uploaded and processed successfully",
                "file_id": file_id
            }
        except Exception as e:
            # Clean up the file if processing fails
            if os.path.exists(file_path):
                os.remove(file_path)
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing file: {str(e)}",
            )
    except Exception as e:
        # Clean up any partially written file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}",
        )

@router.get("/download-template")
async def download_excel_template(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Download a sample Excel template
    """
    try:
        template_path = generate_excel_template()
        return FileResponse(
            path=template_path,
            filename="CashVista_Template.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating template: {str(e)}",
        )
