from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parcel_id = Column(String(100), unique=True, index=True, nullable=False)
    survey_number = Column(String(100), index=True, nullable=False)
    subdivision = Column(String(50), nullable=True)
    district = Column(String(100), default="Coimbatore", nullable=False)
    state = Column(String(100), default="Tamil Nadu", nullable=False)
    village = Column(String(100), default="Demo Village", nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    recorded_area = Column(Float, nullable=False)
    gis_area = Column(Float, nullable=False)
    area_unit = Column(String(50), default="Acres", nullable=False)
    land_use = Column(String(100), default="Residential", nullable=False)
    current_owner = Column(String(255), nullable=False)
    status = Column(String(100), default="Active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    geometry = relationship("ParcelGeometry", uselist=False, back_populates="parcel", cascade="all, delete-orphan")
    history = relationship("ParcelHistory", back_populates="parcel", cascade="all, delete-orphan", order_by="desc(ParcelHistory.created_at)")

    def __repr__(self):
        return f"<Parcel {self.parcel_id} survey={self.survey_number} owner={self.current_owner}>"


class ParcelGeometry(Base):
    __tablename__ = "parcel_geometries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parcel_id = Column(String(100), ForeignKey("parcels.parcel_id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    geometry_type = Column(String(50), default="Polygon", nullable=False)
    coordinates_json = Column(Text, nullable=False)
    geojson = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    parcel = relationship("Parcel", back_populates="geometry")

    def __repr__(self):
        return f"<ParcelGeometry parcel_id={self.parcel_id} type={self.geometry_type}>"


class ParcelHistory(Base):
    __tablename__ = "parcel_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parcel_id = Column(String(100), ForeignKey("parcels.parcel_id", ondelete="CASCADE"), index=True, nullable=False)
    event_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(String(50), nullable=False)
    source = Column(String(150), default="Revenue Dept Records", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    parcel = relationship("Parcel", back_populates="history")

    def __repr__(self):
        return f"<ParcelHistory parcel_id={self.parcel_id} event={self.event_type} date={self.event_date}>"
