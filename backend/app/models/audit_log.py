from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)  # Application, User, Parcel, System
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<AuditLog id={self.id} action={self.action} entity={self.entity_type}:{self.entity_id}>"
