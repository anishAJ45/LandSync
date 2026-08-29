import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "documents")

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def validate_file(file: UploadFile, file_bytes: bytes):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, PNG, JPG, JPEG."
        )
    
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed limit of 10 MB. Current size: {len(file_bytes)/(1024*1024):.2f} MB."
        )

def save_uploaded_file(file: UploadFile, file_bytes: bytes) -> tuple[str, str, int, str]:
    """
    Saves file with a secure UUID-based filename.
    Returns (stored_filename, file_path, file_size, mime_type)
    """
    ensure_upload_dir()
    validate_file(file, file_bytes)
    
    ext = os.path.splitext(file.filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    target_path = os.path.join(UPLOAD_DIR, unique_name)
    
    with open(target_path, "wb") as f:
        f.write(file_bytes)
        
    mime_type = file.content_type or ("application/pdf" if ext == ".pdf" else f"image/{ext.replace('.', '')}")
    return unique_name, target_path, len(file_bytes), mime_type
