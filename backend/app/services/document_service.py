from datetime import datetime
import os
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from app.models.document import (
    Document, DocumentOCRResult, DocumentExtractedField, 
    DocumentVerificationResult, DocumentMismatch,
    ProcessingStatus, VerificationStatus
)
from app.models.application import Application
from app.models.parcel import Parcel
from app.models.user import User
from app.services.file_storage_service import save_uploaded_file
from app.services.ocr_service import OCRService
from app.services.document_classifier import DocumentClassifier
from app.services.field_extraction_service import FieldExtractionService
from app.services.verification_service import VerificationService
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

class DocumentService:
    @staticmethod
    def generate_document_id(db: Session) -> str:
        year = datetime.utcnow().year
        count = db.query(Document).count() + 1
        return f"DOC-{year}-{count:06d}"

    @classmethod
    def upload_document(
        cls,
        db: Session,
        file: UploadFile,
        uploaded_by_user_id: int,
        application_id: Optional[str] = None,
        document_type: str = "OTHER_LAND_DOCUMENT"
    ) -> Document:
        file_bytes = file.file.read()
        stored_filename, file_path, file_size, mime_type = save_uploaded_file(file, file_bytes)

        # Find linked parcel if application is provided
        parcel_id = None
        if application_id:
            app_obj = db.query(Application).filter(Application.application_id == application_id).first()
            if app_obj:
                parcel_id = app_obj.parcel_id

        doc_id = cls.generate_document_id(db)
        
        doc = Document(
            document_id=doc_id,
            application_id=application_id,
            parcel_id=parcel_id,
            uploaded_by=uploaded_by_user_id,
            document_type=document_type,
            original_filename=file.filename or "uploaded_document",
            stored_filename=stored_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            processing_status=ProcessingStatus.UPLOADED.value,
            verification_status=VerificationStatus.PENDING.value
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        AuditService.log(
            db=db,
            user_id=uploaded_by_user_id,
            action="DOCUMENT_UPLOADED",
            entity_type="DOCUMENT",
            entity_id=doc.document_id,
            details=f"Uploaded {doc.original_filename} ({doc.document_type}) for Application {application_id or 'Unlinked'}"
        )

        # Trigger automatic OCR & Verification Pipeline
        cls.process_document_pipeline(db, doc.id)
        db.refresh(doc)
        return doc

    @classmethod
    def process_document_pipeline(cls, db: Session, doc_id_or_pk: int) -> Document:
        doc = db.query(Document).filter(Document.id == doc_id_or_pk).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")

        doc.processing_status = ProcessingStatus.PROCESSING.value
        db.commit()

        AuditService.log(
            db=db,
            user_id=doc.uploaded_by,
            action="OCR_STARTED",
            entity_type="DOCUMENT",
            entity_id=doc.document_id,
            details="Automated Tesseract OCR pipeline commenced."
        )

        try:
            # 1. OCR Extraction
            ext = os.path.splitext(doc.file_path)[1].lower()
            if ext == ".pdf":
                raw_text, page_count, avg_conf, proc_time = OCRService.extract_text_from_pdf(doc.file_path)
            else:
                raw_text, avg_conf, proc_time = OCRService.extract_text_from_image(doc.file_path)
                page_count = 1

            clean_text = OCRService.clean_text(raw_text)

            # Store OCR Result
            ocr_res = doc.ocr_result
            if not ocr_res:
                ocr_res = DocumentOCRResult(document_id=doc.document_id)
                db.add(ocr_res)
            ocr_res.raw_text = raw_text
            ocr_res.cleaned_text = clean_text
            ocr_res.page_count = page_count
            ocr_res.average_confidence = avg_conf
            ocr_res.processing_time = proc_time
            doc.ocr_status = "COMPLETED"
            doc.processing_status = ProcessingStatus.OCR_COMPLETED.value
            db.commit()

            AuditService.log(
                db=db,
                user_id=doc.uploaded_by,
                action="OCR_COMPLETED",
                entity_type="DOCUMENT",
                entity_id=doc.document_id,
                details=f"OCR completed ({page_count} pages, {avg_conf:.1f}% confidence, {proc_time}s)"
            )

            # 2. Document Classification
            detected_type, cat_conf, cat_reason, is_mismatch = DocumentClassifier.classify_document(
                clean_text, doc.document_type, doc.original_filename
            )
            doc.detected_type = detected_type

            # 3. Field Extraction
            extracted_data = FieldExtractionService.extract_fields(clean_text, doc.document_type)
            # Remove old fields
            db.query(DocumentExtractedField).filter(DocumentExtractedField.document_id == doc.document_id).delete()
            for ef in extracted_data:
                field_obj = DocumentExtractedField(
                    document_id=doc.document_id,
                    field_name=ef["field_name"],
                    field_value=ef["field_value"],
                    normalized_value=ef["normalized_value"],
                    confidence=ef["confidence"],
                    source_text=ef.get("source_text"),
                    status=ef.get("status", "FOUND")
                )
                db.add(field_obj)
            
            doc.processing_status = ProcessingStatus.EXTRACTION_COMPLETED.value
            db.commit()

            AuditService.log(
                db=db,
                user_id=doc.uploaded_by,
                action="FIELD_EXTRACTION_COMPLETED",
                entity_type="DOCUMENT",
                entity_id=doc.document_id,
                details=f"Extracted {len(extracted_data)} structured cadastral entities."
            )

            # 4. Cross-Record Verification
            parcel_dict = None
            if doc.parcel_id:
                p = db.query(Parcel).filter(Parcel.parcel_id == doc.parcel_id).first()
                if p:
                    parcel_dict = {
                        "parcel_id": p.parcel_id,
                        "owner_name": p.owner_name,
                        "survey_number": p.survey_number,
                        "district": p.district,
                        "village": p.taluk,
                        "area_sqft": p.area_sqft,
                        "area_acres": (p.area_sqft / 43560.0) if p.area_sqft else 0.0
                    }

            app_dict = None
            if doc.application_id:
                app_obj = db.query(Application).filter(Application.application_id == doc.application_id).first()
                if app_obj:
                    citizen = db.query(User).filter(User.id == app_obj.citizen_id).first()
                    app_dict = {
                        "application_id": app_obj.application_id,
                        "citizen_name": citizen.full_name if citizen else None,
                        "service_type": app_obj.service_type
                    }

            v_res_data, mismatches_data = VerificationService.verify_document_against_records(
                extracted_data, parcel_dict, app_dict
            )

            # Save Verification Result
            ver_res = doc.verification_result
            if not ver_res:
                ver_res = DocumentVerificationResult(
                    document_id=doc.document_id,
                    application_id=doc.application_id,
                    parcel_id=doc.parcel_id
                )
                db.add(ver_res)
            
            ver_res.overall_score = v_res_data["overall_score"]
            ver_res.verification_status = v_res_data["verification_status"]
            ver_res.confidence_level = v_res_data["confidence_level"]
            ver_res.mismatch_count = v_res_data["mismatch_count"]
            ver_res.critical_mismatch_count = v_res_data["critical_mismatch_count"]
            ver_res.summary = v_res_data["summary"]
            ver_res.review_required = v_res_data["review_required"]

            # Save Mismatches
            db.query(DocumentMismatch).filter(DocumentMismatch.document_id == doc.document_id).delete()
            for mm in mismatches_data:
                m_obj = DocumentMismatch(
                    document_id=doc.document_id,
                    field_name=mm["field_name"],
                    document_value=mm.get("document_value"),
                    system_value=mm.get("system_value"),
                    match_type=mm["match_type"],
                    severity=mm["severity"],
                    confidence=mm["confidence"],
                    description=mm["description"]
                )
                db.add(m_obj)

            doc.verification_status = v_res_data["verification_status"]
            doc.processing_status = ProcessingStatus.VERIFICATION_COMPLETED.value
            doc.processed_at = datetime.utcnow()
            db.commit()

            # Audit & Notifications
            AuditService.log(
                db=db,
                user_id=doc.uploaded_by,
                action="VERIFICATION_COMPLETED",
                entity_type="DOCUMENT",
                entity_id=doc.document_id,
                details=f"Verification Score: {ver_res.overall_score:.0f}/100 ({ver_res.confidence_level}), Mismatches: {len(mismatches_data)}"
            )

            NotificationService.send_notification(
                db=db,
                user_id=doc.uploaded_by,
                title="Document Verified by AI/OCR Engine",
                message=f"Document {doc.document_id} has been processed. Score: {ver_res.overall_score:.0f}/100.",
                notification_type="SYSTEM"
            )

        except Exception as e:
            doc.processing_status = ProcessingStatus.FAILED.value
            doc.verification_status = VerificationStatus.FAILED.value
            db.commit()
            print(f"[DocumentService Error] Pipeline failed for {doc.document_id}: {str(e)}")

        return doc

    @staticmethod
    def get_required_documents_for_application(db: Session, application_id: str) -> Dict[str, Any]:
        app_obj = db.query(Application).filter(Application.application_id == application_id).first()
        if not app_obj:
            raise HTTPException(status_code=404, detail="Application not found.")

        # Determine requirements by service_type
        srv = (app_obj.service_type or "").upper()
        if "OWNERSHIP" in srv:
            req_types = ["SALE_DEED", "IDENTITY_DOCUMENT", "PATTA"]
        elif "LAND RECORD" in srv or "CORRECTION" in srv:
            req_types = ["PATTA", "LAND_SURVEY_DOCUMENT", "IDENTITY_DOCUMENT"]
        elif "BOUNDARY" in srv or "AREA" in srv:
            req_types = ["LAND_SURVEY_DOCUMENT", "PATTA", "PROPERTY_TAX_RECORD"]
        else:
            req_types = ["PATTA", "IDENTITY_DOCUMENT"]

        uploaded_docs = db.query(Document).filter(Document.application_id == application_id).all()
        uploaded_types = set(d.document_type for d in uploaded_docs)
        
        missing = [t for t in req_types if t not in uploaded_types]
        is_complete = len(missing) == 0

        return {
            "application_id": application_id,
            "service_type": app_obj.service_type,
            "required_document_types": req_types,
            "uploaded_documents": uploaded_docs,
            "missing_document_types": missing,
            "is_complete": is_complete,
            "status_summary": "All required documents uploaded" if is_complete else f"{len(missing)} documents pending upload"
        }
