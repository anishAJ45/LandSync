from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class DocumentBase(BaseModel):
    application_id: Optional[str] = None
    parcel_id: Optional[str] = None
    document_type: str = "OTHER_LAND_DOCUMENT"

class DocumentCreate(DocumentBase):
    pass

class ExtractedFieldOut(BaseModel):
    id: Optional[int] = None
    field_name: str
    field_value: str
    normalized_value: str
    confidence: float
    source_text: Optional[str] = None
    status: str = "FOUND"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MismatchOut(BaseModel):
    id: Optional[int] = None
    field_name: str
    document_value: Optional[str] = None
    system_value: Optional[str] = None
    match_type: str
    severity: str
    confidence: float
    description: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OCRResultOut(BaseModel):
    id: Optional[int] = None
    document_id: str
    raw_text: str
    cleaned_text: str
    page_count: int
    average_confidence: float
    processing_time: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VerificationResultOut(BaseModel):
    id: Optional[int] = None
    document_id: str
    application_id: Optional[str] = None
    parcel_id: Optional[str] = None
    overall_score: float
    verification_status: str
    confidence_level: str
    mismatch_count: int
    critical_mismatch_count: int
    summary: str
    review_required: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentDetailOut(BaseModel):
    id: int
    document_id: str
    application_id: Optional[str] = None
    parcel_id: Optional[str] = None
    uploaded_by: int
    uploader_name: Optional[str] = None
    document_type: str
    detected_type: Optional[str] = None
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str
    upload_status: str
    processing_status: str
    ocr_status: str
    verification_status: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    
    ocr_result: Optional[OCRResultOut] = None
    extracted_fields: List[ExtractedFieldOut] = []
    verification_result: Optional[VerificationResultOut] = None
    mismatches: List[MismatchOut] = []

    class Config:
        from_attributes = True

class DocumentListItemOut(BaseModel):
    id: int
    document_id: str
    application_id: Optional[str] = None
    parcel_id: Optional[str] = None
    uploaded_by: int
    uploader_name: Optional[str] = None
    document_type: str
    detected_type: Optional[str] = None
    original_filename: str
    file_size: int
    mime_type: str
    processing_status: str
    verification_status: str
    overall_score: Optional[float] = None
    mismatch_count: Optional[int] = 0
    critical_mismatch_count: Optional[int] = 0
    uploaded_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OfficerReviewActionRequest(BaseModel):
    action: str # "APPROVE_VERIFICATION", "REQUEST_REUPLOAD", "ADD_NOTE"
    remarks: Optional[str] = None
    reupload_reason: Optional[str] = None

class RequiredDocumentsResponse(BaseModel):
    application_id: str
    service_type: str
    required_document_types: List[str]
    uploaded_documents: List[DocumentListItemOut]
    missing_document_types: List[str]
    is_complete: bool
    status_summary: str
