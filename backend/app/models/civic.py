"""
LandSync SIH26014 - Phase 9: Civic, Fiscal & Infrastructure Integration Models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class PropertyTaxRecord(Base):
    __tablename__ = "property_tax_records"

    id = Column(Integer, primary_key=True, index=True)
    tax_record_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    property_reference = Column(String(100), nullable=False)
    local_body = Column(String(150), nullable=False)
    assessment_year = Column(String(20), nullable=False)
    property_type = Column(String(50), nullable=False) # RESIDENTIAL, COMMERCIAL, INDUSTRIAL, etc.
    assessed_value = Column(Float, nullable=False)
    annual_tax = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    amount_due = Column(Float, default=0.0)
    payment_status = Column(String(50), default="PENDING") # PAID, PARTIALLY_PAID, PENDING, OVERDUE, DISPUTED
    last_payment_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=False)
    arrears = Column(Float, default=0.0)
    tax_payer_name = Column(String(200), nullable=True)
    history = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LandValuationReference(Base):
    __tablename__ = "land_valuation_references"

    id = Column(Integer, primary_key=True, index=True)
    valuation_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    location_reference = Column(String(200), nullable=False)
    land_category = Column(String(100), nullable=False)
    reference_rate = Column(Float, nullable=False)
    unit = Column(String(30), default="INR/Sq.Ft")
    min_rate = Column(Float, default=0.0)
    max_rate = Column(Float, default=0.0)
    effective_date = Column(DateTime, default=datetime.utcnow)
    source_authority = Column(String(150), nullable=False) # e.g., Inspector General of Registration (IGRS)
    confidence_level = Column(String(30), default="HIGH")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WaterConnection(Base):
    __tablename__ = "water_connections"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    provider = Column(String(150), nullable=False) # TWAD Board / Municipal Corp
    connection_status = Column(String(50), default="AVAILABLE") # CONNECTED, AVAILABLE, PENDING, NOT_AVAILABLE, UNDER_MAINTENANCE
    connection_type = Column(String(50), default="DOMESTIC")
    meter_status = Column(String(50), default="METERED_ACTIVE")
    supply_status = Column(String(50), default="NORMAL_24X7")
    pipeline_distance_meters = Column(Float, default=0.0)
    application_reference = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ElectricityConnection(Base):
    __tablename__ = "electricity_connections"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    provider = Column(String(150), nullable=False) # TANGEDCO / Electricity Board
    connection_status = Column(String(50), default="CONNECTED") # CONNECTED, AVAILABLE, PENDING, NOT_AVAILABLE, UNDER_MAINTENANCE
    connection_type = Column(String(50), default="LT_RESIDENTIAL")
    meter_status = Column(String(50), default="SMART_METER_LIVE")
    service_status = Column(String(50), default="ACTIVE_ENERGIZED")
    sanctioned_load_kw = Column(Float, default=5.0)
    transformer_distance_meters = Column(Float, default=50.0)
    application_reference = Column(String(100), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DrainageInfrastructure(Base):
    __tablename__ = "drainage_infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    infrastructure_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    infrastructure_type = Column(String(50), nullable=False) # STORM_WATER_DRAIN, SEWER_LINE, SEWAGE_TREATMENT, DRAINAGE_CHANNEL
    availability_status = Column(String(50), default="AVAILABLE")
    provider = Column(String(150), nullable=False)
    distance_to_network = Column(Float, default=0.0)
    connection_status = Column(String(50), default="CONNECTED")
    geometry = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RoadAccessRecord(Base):
    __tablename__ = "road_access_records"

    id = Column(Integer, primary_key=True, index=True)
    road_access_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    road_name = Column(String(150), nullable=False)
    road_type = Column(String(50), nullable=False) # HIGHWAY, MAIN_ROAD, LOCAL_ROAD, PRIVATE_ROAD, SERVICE_ROAD, FOOTPATH
    road_width = Column(Float, nullable=False)
    distance_to_road = Column(Float, default=0.0)
    access_status = Column(String(50), default="GOOD_ACCESS") # GOOD_ACCESS, LIMITED_ACCESS, NO_DIRECT_ACCESS, REQUIRES_REVIEW
    authority = Column(String(150), nullable=False) # Highways Dept / Panchayat / Municipality
    right_of_way_clear = Column(Boolean, default=True)
    geometry = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InfrastructureProject(Base):
    __tablename__ = "infrastructure_projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String(50), unique=True, index=True, nullable=False)
    project_name = Column(String(200), nullable=False)
    project_type = Column(String(50), nullable=False) # ROAD_PROJECT, METRO, RAILWAY, WATER_PROJECT, SMART_CITY, PUBLIC_BUILDING, UTILITY_PROJECT
    authority = Column(String(150), nullable=False)
    status = Column(String(50), default="UNDER_CONSTRUCTION")
    start_date = Column(DateTime, nullable=False)
    expected_completion = Column(DateTime, nullable=False)
    description = Column(Text, nullable=False)
    affected_area = Column(String(200), nullable=False)
    investment_inr_cr = Column(Float, default=0.0)
    influence_radius_meters = Column(Float, default=500.0)
    geometry = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DigitalInfrastructureRecord(Base):
    __tablename__ = "digital_infrastructure_records"

    id = Column(Integer, primary_key=True, index=True)
    infrastructure_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    infrastructure_type = Column(String(50), nullable=False) # FIBER, BROADBAND, MOBILE_NETWORK, PUBLIC_WIFI, DIGITAL_SERVICE_POINT
    provider = Column(String(150), nullable=False) # BSNL / BharatNet / Airtel / Jio
    availability_status = Column(String(50), default="HIGH_SPEED_AVAILABLE")
    connection_status = Column(String(50), default="CONNECTED")
    max_speed_mbps = Column(Integer, default=100)
    mobile_5g_coverage = Column(Boolean, default=True)
    geometry = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CivicServiceProfile(Base):
    __tablename__ = "civic_service_profiles"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(50), ForeignKey("parcels.parcel_id"), unique=True, index=True, nullable=False)
    ulpin = Column(String(50), index=True, nullable=False)
    water_status = Column(String(50), default="CONNECTED")
    electricity_status = Column(String(50), default="CONNECTED")
    drainage_status = Column(String(50), default="AVAILABLE")
    sewerage_status = Column(String(50), default="PENDING")
    road_access_status = Column(String(50), default="GOOD_ACCESS")
    telecom_status = Column(String(50), default="HIGH_SPEED_AVAILABLE")
    property_tax_status = Column(String(50), default="PAID")
    overall_civic_readiness = Column(String(100), default="WELL_CONNECTED")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
