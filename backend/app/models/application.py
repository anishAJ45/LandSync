from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database.database import Base

class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    MORE_INFORMATION_REQUIRED = "MORE_INFORMATION_REQUIRED"
    VERIFIED = "VERIFIED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"

class ApplicationPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ServiceType(str, enum.Enum):
    LAND_RECORD_VERIFICATION = "LAND RECORD VERIFICATION"
    OWNERSHIP_VERIFICATION = "OWNERSHIP VERIFICATION"
    PARCEL_INFORMATION_REQUEST = "PARCEL INFORMATION REQUEST"
    DOCUMENT_VERIFICATION = "DOCUMENT VERIFICATION"
    AREA_DISCREPANCY_REVIEW = "AREA DISCREPANCY REVIEW"
    BOUNDARY_DISCREPANCY_REPORT = "BOUNDARY DISCREPANCY REPORT"
    LAND_RECORD_CORRECTION_REQUEST = "LAND RECORD CORRECTION REQUEST"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(100), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    service_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default=ApplicationStatus.SUBMITTED.value, nullable=False)
    priority = Column(String(50), default=ApplicationPriority.MEDIUM.value, nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], backref="applications_submitted")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], backref="applications_assigned")
    parcel = relationship("Parcel", backref="applications")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan", order_by="asc(ApplicationStatusHistory.created_at)")
    notes = relationship("OfficerNotes", back_populates="application", cascade="all, delete-orphan", order_by="asc(OfficerNotes.created_at)")

    def __repr__(self):
        return f"<Application {self.application_id} parcel={self.parcel_id} status={self.status}>"


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(String(50), ForeignKey("applications.application_id", ondelete="CASCADE"), index=True, nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by = Column(String(255), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    application = relationship("Application", back_populates="status_history")

    def __repr__(self):
        return f"<ApplicationStatusHistory app={self.application_id} {self.previous_status}->{self.new_status}>"


class OfficerNotes(Base):
    __tablename__ = "officer_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(String(50), ForeignKey("applications.application_id", ondelete="CASCADE"), index=True, nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note = Column(Text, nullable=False)
    note_type = Column(String(50), default="INTERNAL", nullable=False)  # INTERNAL, CITIZEN_VISIBLE, ACTION_REQUIRED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    application = relationship("Application", back_populates="notes")
    officer = relationship("User", foreign_keys=[officer_id])

    def __repr__(self):
        return f"<OfficerNotes app={self.application_id} officer={self.officer_id}>"
