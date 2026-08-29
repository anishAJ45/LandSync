from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from app.database.database import Base

class DocumentType(str, enum.Enum):
    SALE_DEED = "SALE_DEED"
    PATTA = "PATTA"
    ENCUMBRANCE_CERTIFICATE = "ENCUMBRANCE_CERTIFICATE"
    PROPERTY_TAX_RECORD = "PROPERTY_TAX_RECORD"
    LAND_SURVEY_DOCUMENT = "LAND_SURVEY_DOCUMENT"
    IDENTITY_DOCUMENT = "IDENTITY_DOCUMENT"
    OTHER_LAND_DOCUMENT = "OTHER_LAND_DOCUMENT"

class ProcessingStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    OCR_COMPLETED = "OCR_COMPLETED"
    EXTRACTION_COMPLETED = "EXTRACTION_COMPLETED"
    VERIFICATION_COMPLETED = "VERIFICATION_COMPLETED"
    FAILED = "FAILED"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    MISMATCH_FOUND = "MISMATCH_FOUND"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    FAILED = "FAILED"

class MatchType(str, enum.Enum):
    EXACT_MATCH = "EXACT_MATCH"
    FUZZY_MATCH = "FUZZY_MATCH"
    MINOR_DIFFERENCE = "MINOR_DIFFERENCE"
    MISMATCH = "MISMATCH"
    MISSING_IN_DOCUMENT = "MISSING_IN_DOCUMENT"
    MISSING_IN_SYSTEM = "MISSING_IN_SYSTEM"

class MismatchSeverity(str, enum.Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. DOC-2026-000001
    application_id = Column(String(50), ForeignKey("applications.application_id", ondelete="SET NULL"), index=True, nullable=True)
    parcel_id = Column(String(100), ForeignKey("parcels.parcel_id", ondelete="SET NULL"), index=True, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    
    document_type = Column(String(50), default=DocumentType.OTHER_LAND_DOCUMENT.value, nullable=False)
    detected_type = Column(String(50), nullable=True)
    
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False) # In bytes
    mime_type = Column(String(100), nullable=False)
    
    upload_status = Column(String(50), default="COMPLETED", nullable=False)
    processing_status = Column(String(50), default=ProcessingStatus.UPLOADED.value, nullable=False)
    ocr_status = Column(String(50), default="PENDING", nullable=False)
    verification_status = Column(String(50), default=VerificationStatus.PENDING.value, nullable=False)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    processed_at = Column(DateTime, nullable=True)

    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by], backref="uploaded_documents")
    application = relationship("Application", backref="documents")
    parcel = relationship("Parcel", backref="documents")
    
    ocr_result = relationship("DocumentOCRResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    extracted_fields = relationship("DocumentExtractedField", back_populates="document", cascade="all, delete-orphan")
    verification_result = relationship("DocumentVerificationResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    mismatches = relationship("DocumentMismatch", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document {self.document_id} type={self.document_type} status={self.processing_status}>"


class DocumentOCRResult(Base):
    __tablename__ = "document_ocr_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(String(50), ForeignKey("documents.document_id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    raw_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    average_confidence = Column(Float, default=0.0, nullable=False) # 0.0 to 100.0
    processing_time = Column(Float, default=0.0, nullable=False) # In seconds
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="ocr_result")

    def __repr__(self):
        return f"<DocumentOCRResult doc={self.document_id} pages={self.page_count} conf={self.average_confidence}>"


class DocumentExtractedField(Base):
    __tablename__ = "document_extracted_fields"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(String(50), ForeignKey("documents.document_id", ondelete="CASCADE"), index=True, nullable=False)
    field_name = Column(String(100), nullable=False) # e.g. OWNER_NAME, SURVEY_NUMBER, LAND_AREA
    field_value = Column(Text, nullable=False) # Extracted value
    normalized_value = Column(Text, nullable=False) # Normalized value
    confidence = Column(Float, default=0.0, nullable=False) # 0.0 to 100.0
    source_text = Column(Text, nullable=True) # Context snippet from OCR text
    status = Column(String(50), default="FOUND", nullable=False) # FOUND, NOT_FOUND, LOW_CONFIDENCE
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="extracted_fields")

    def __repr__(self):
        return f"<DocumentExtractedField doc={self.document_id} {self.field_name}={self.field_value}>"


class DocumentVerificationResult(Base):
    __tablename__ = "document_verification_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(String(50), ForeignKey("documents.document_id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    application_id = Column(String(50), ForeignKey("applications.application_id", ondelete="SET NULL"), nullable=True)
    parcel_id = Column(String(100), ForeignKey("parcels.parcel_id", ondelete="SET NULL"), nullable=True)
    
    overall_score = Column(Float, default=100.0, nullable=False) # 0.0 to 100.0
    verification_status = Column(String(50), default=VerificationStatus.PENDING.value, nullable=False)
    confidence_level = Column(String(50), default="HIGH CONFIDENCE", nullable=False)
    mismatch_count = Column(Integer, default=0, nullable=False)
    critical_mismatch_count = Column(Integer, default=0, nullable=False)
    summary = Column(Text, nullable=False)
    review_required = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="verification_result")

    def __repr__(self):
        return f"<DocumentVerificationResult doc={self.document_id} score={self.overall_score} status={self.verification_status}>"


class DocumentMismatch(Base):
    __tablename__ = "document_mismatches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(String(50), ForeignKey("documents.document_id", ondelete="CASCADE"), index=True, nullable=False)
    field_name = Column(String(100), nullable=False) # e.g. SURVEY_NUMBER
    document_value = Column(Text, nullable=True)
    system_value = Column(Text, nullable=True)
    match_type = Column(String(50), default=MatchType.MISMATCH.value, nullable=False)
    severity = Column(String(50), default=MismatchSeverity.LOW.value, nullable=False)
    confidence = Column(Float, default=0.0, nullable=False) # 0.0 to 100.0
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="mismatches")

    def __repr__(self):
        return f"<DocumentMismatch doc={self.document_id} field={self.field_name} sev={self.severity}>"
