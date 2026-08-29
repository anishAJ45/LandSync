from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.document import Document, DocumentType, ProcessingStatus, VerificationStatus
from app.schemas.document import (
    DocumentListItemOut, DocumentDetailOut, OCRResultOut,
    ExtractedFieldOut, VerificationResultOut, MismatchOut,
    OfficerReviewActionRequest, RequiredDocumentsResponse
)
from app.services.auth_service import get_current_active_user, require_roles
from app.services.document_service import DocumentService
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/documents", tags=["Document Intelligence & OCR"])

@router.post("/upload", response_model=DocumentDetailOut)
def upload_document(
    file: UploadFile = File(...),
    application_id: Optional[str] = Form(None),
    document_type: str = Form("OTHER_LAND_DOCUMENT"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a cadastral deed, patta, survey sketch, or tax record (PDF, PNG, JPG, JPEG up to 10MB)
    and automatically trigger the Tesseract OCR and field verification pipeline.
    """
    doc = DocumentService.upload_document(
        db=db,
        file=file,
        uploaded_by_user_id=current_user.id,
        application_id=application_id,
        document_type=document_type
    )
    return doc

@router.get("", response_model=List[DocumentListItemOut])
def list_documents(
    application_id: Optional[str] = Query(None),
    document_type: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Role-aware document list. Citizens see only their own uploads; Officers/Admins see all records.
    """
    query = db.query(Document)
    if current_user.role == UserRole.CITIZEN:
        query = query.filter(Document.uploaded_by == current_user.id)
    
    if application_id:
        query = query.filter(Document.application_id == application_id)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    if verification_status:
        query = query.filter(Document.verification_status == verification_status)

    docs = query.order_by(Document.uploaded_at.desc()).all()
    
    # Enrich with score if verification result exists
    result = []
    for d in docs:
        item = DocumentListItemOut(
            id=d.id,
            document_id=d.document_id,
            application_id=d.application_id,
            parcel_id=d.parcel_id,
            uploaded_by=d.uploaded_by,
            uploader_name=d.uploader.full_name if d.uploader else None,
            document_type=d.document_type,
            detected_type=d.detected_type,
            original_filename=d.original_filename,
            file_size=d.file_size,
            mime_type=d.mime_type,
            processing_status=d.processing_status,
            verification_status=d.verification_status,
            overall_score=d.verification_result.overall_score if d.verification_result else None,
            mismatch_count=d.verification_result.mismatch_count if d.verification_result else 0,
            critical_mismatch_count=d.verification_result.critical_mismatch_count if d.verification_result else 0,
            uploaded_at=d.uploaded_at,
            processed_at=d.processed_at
        )
        result.append(item)
    return result

@router.get("/{document_id}", response_model=DocumentDetailOut)
def get_document_details(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Fetch comprehensive document record, OCR transcript, extracted structured fields, and mismatch report.
    """
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if current_user.role == UserRole.CITIZEN and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden: You do not own this document.")

    return doc

@router.get("/{document_id}/ocr", response_model=OCRResultOut)
def get_ocr_result(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc or not doc.ocr_result:
        raise HTTPException(status_code=404, detail="OCR transcript not found for this document.")

    if current_user.role == UserRole.CITIZEN and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    return doc.ocr_result

@router.get("/{document_id}/fields", response_model=List[ExtractedFieldOut])
def get_extracted_fields(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if current_user.role == UserRole.CITIZEN and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    return doc.extracted_fields

@router.get("/{document_id}/verification", response_model=VerificationResultOut)
def get_verification_result(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc or not doc.verification_result:
        raise HTTPException(status_code=404, detail="Verification analysis not found for this document.")

    if current_user.role == UserRole.CITIZEN and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    return doc.verification_result

@router.get("/{document_id}/mismatches", response_model=List[MismatchOut])
def get_document_mismatches(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if current_user.role == UserRole.CITIZEN and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    return doc.mismatches

@router.post("/{document_id}/reprocess", response_model=DocumentDetailOut)
def reprocess_document(
    document_id: str,
    current_user: User = Depends(require_roles([UserRole.OFFICER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Reruns the Tesseract OCR, field parser, and cross-record comparison engine.
    """
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    AuditService.log(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_REPROCESSED",
        entity_type="DOCUMENT",
        entity_id=doc.document_id,
        details=f"Document reprocessed by {current_user.full_name} ({current_user.role})"
    )

    doc = DocumentService.process_document_pipeline(db, doc.id)
    return doc

@router.post("/{document_id}/review")
def review_document(
    document_id: str,
    payload: OfficerReviewActionRequest,
    current_user: User = Depends(require_roles([UserRole.OFFICER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if payload.action == "APPROVE_VERIFICATION":
        doc.verification_status = VerificationStatus.VERIFIED.value
        db.commit()
        
        AuditService.log(
            db=db,
            user_id=current_user.id,
            action="OFFICER_REVIEWED_DOCUMENT",
            entity_type="DOCUMENT",
            entity_id=doc.document_id,
            details=f"Officer {current_user.full_name} manually endorsed document verification."
        )
        NotificationService.send_notification(
            db=db,
            user_id=doc.uploaded_by,
            title="Document Verification Endorsed",
            message=f"Your document {doc.document_id} has been verified by the inspecting officer.",
            notification_type="SYSTEM"
        )
        return {"status": "success", "message": "Document verification approved."}

    elif payload.action == "REQUEST_REUPLOAD":
        doc.verification_status = VerificationStatus.REVIEW_REQUIRED.value
        db.commit()

        reason = payload.reupload_reason or payload.remarks or "Document illegible or mismatched."
        AuditService.log(
            db=db,
            user_id=current_user.id,
            action="REUPLOAD_REQUESTED",
            entity_type="DOCUMENT",
            entity_id=doc.document_id,
            details=f"Re-upload requested: {reason}"
        )
        NotificationService.send_notification(
            db=db,
            user_id=doc.uploaded_by,
            title="Re-Upload Requested for Document",
            message=f"Please re-upload {doc.document_type} for {doc.document_id}. Reason: {reason}",
            notification_type="ACTION_REQUIRED"
        )
        return {"status": "success", "message": "Re-upload request sent to citizen."}

    return {"status": "success", "message": "Officer note registered."}
