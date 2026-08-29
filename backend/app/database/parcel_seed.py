import json
import os
from sqlalchemy.orm import Session
from app.models.parcel import Parcel, ParcelGeometry, ParcelHistory

SEED_PARCELS_DATA = [
    {
        "parcel_id": "TN-CBE-001-124-1",
        "survey_number": "124/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0260,
        "longitude": 77.0320,
        "recorded_area": 2.50,
        "gis_area": 2.50,
        "area_unit": "Acres",
        "land_use": "Residential",
        "current_owner": "Ravi Kumar",
        "status": "Active",
        "coordinates": [
            [[77.0310, 11.0250], [77.0330, 11.0250], [77.0330, 11.0270], [77.0310, 11.0270], [77.0310, 11.0250]]
        ],
        "history": [
            {"event_type": "Title Deed Registration", "description": "Conveyance deed registered under Doc No. 1024/2021 at Sub-Registrar Sulur.", "event_date": "2021-04-12", "source": "Registration Dept (IGRS)"},
            {"event_type": "Patta Mutation", "description": "Patta issued in favor of Ravi Kumar by Tahsildar Coimbatore South.", "event_date": "2021-06-20", "source": "Tamil Nilam Land Revenue"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-124-2",
        "survey_number": "124/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0260,
        "longitude": 77.0340,
        "recorded_area": 2.50,
        "gis_area": 2.42,
        "area_unit": "Acres",
        "land_use": "Residential",
        "current_owner": "S. Murugan",
        "status": "Active",
        "coordinates": [
            [[77.0330, 11.0250], [77.0350, 11.0250], [77.0350, 11.0270], [77.0330, 11.0270], [77.0330, 11.0250]]
        ],
        "history": [
            {"event_type": "Sub-division Survey", "description": "Partition sub-division of ancestral field Survey 124 executed.", "event_date": "2018-09-14", "source": "Survey & Settlement Office"},
            {"event_type": "DGPS Cadastral Mapping", "description": "Satellite DGPS resurvey recorded 2.42 Acres (0.08 Acre minor variation).", "event_date": "2023-11-05", "source": "State Cadastral Survey"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-124-3",
        "survey_number": "124/3",
        "subdivision": "3",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0260,
        "longitude": 77.0361,
        "recorded_area": 1.80,
        "gis_area": 1.95,
        "area_unit": "Acres",
        "land_use": "Commercial",
        "current_owner": "Senthil Enterprises",
        "status": "Under Review",
        "coordinates": [
            [[77.0350, 11.0250], [77.0373, 11.0250], [77.0373, 11.0270], [77.0350, 11.0270], [77.0350, 11.0250]]
        ],
        "history": [
            {"event_type": "Commercial Land Conversion", "description": "Change of land use permit granted by DTCP.", "event_date": "2024-02-10", "source": "Directorate of Town & Country Planning"},
            {"event_type": "Overlap Flag Raised", "description": "GIS engine detected boundary polygon overlap with Parcel 125/1 on the eastern boundary.", "event_date": "2026-01-15", "source": "LandSync DPI Verification"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-125-1",
        "survey_number": "125/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0260,
        "longitude": 77.0381,
        "recorded_area": 3.20,
        "gis_area": 3.10,
        "area_unit": "Acres",
        "land_use": "Commercial",
        "current_owner": "Apex Logistics Pvt Ltd",
        "status": "Boundary Discrepancy",
        "coordinates": [
            [[77.0368, 11.0250], [77.0395, 11.0250], [77.0395, 11.0270], [77.0368, 11.0270], [77.0368, 11.0250]]
        ],
        "history": [
            {"event_type": "Industrial Purchase", "description": "Purchased by Apex Logistics via registered deed Doc 4410/2022.", "event_date": "2022-08-19", "source": "IGRS Sub-Registrar"},
            {"event_type": "Boundary Dispute Notice", "description": "Joint inspection scheduled to resolve 0.15 Acre overlap with 124/3.", "event_date": "2026-02-01", "source": "Revenue Divisional Officer"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-125-2",
        "survey_number": "125/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0258,
        "longitude": 77.0410,
        "recorded_area": 5.40,
        "gis_area": 5.38,
        "area_unit": "Acres",
        "land_use": "Agricultural",
        "current_owner": "K. Muthusamy",
        "status": "Active",
        "coordinates": [
            [[77.0395, 11.0245], [77.0425, 11.0245], [77.0425, 11.0270], [77.0395, 11.0270], [77.0395, 11.0245]]
        ],
        "history": [
            {"event_type": "Ryotwari Patta Grant", "description": "Permanent settlement revenue entry confirmed.", "event_date": "2015-05-11", "source": "Tamil Nilam"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-126-1",
        "survey_number": "126/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0282,
        "longitude": 77.0322,
        "recorded_area": 4.20,
        "gis_area": 4.19,
        "area_unit": "Acres",
        "land_use": "Agricultural",
        "current_owner": "Meenakshi Ammal",
        "status": "Active",
        "coordinates": [
            [[77.0310, 11.0270], [77.0335, 11.0270], [77.0335, 11.0295], [77.0310, 11.0295], [77.0310, 11.0270]]
        ],
        "history": [
            {"event_type": "Succession Patta", "description": "Legal heir succession certificate recorded.", "event_date": "2020-03-18", "source": "Tahsildar Desk"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-126-2",
        "survey_number": "126/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0282,
        "longitude": 77.0347,
        "recorded_area": 3.80,
        "gis_area": 3.52,
        "area_unit": "Acres",
        "land_use": "Agricultural",
        "current_owner": "R. Palanisamy",
        "status": "Under Review",
        "coordinates": [
            [[77.0335, 11.0270], [77.0360, 11.0270], [77.0360, 11.0295], [77.0335, 11.0295], [77.0335, 11.0270]]
        ],
        "history": [
            {"event_type": "Major Area Mismatch Alert", "description": "GIS calculated area is 7.4% less than recorded revenue patta area. Field resurvey requested.", "event_date": "2026-02-14", "source": "LandSync Automated GIS Audit"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-127-1",
        "survey_number": "127/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0282,
        "longitude": 77.0380,
        "recorded_area": 8.50,
        "gis_area": 8.50,
        "area_unit": "Acres",
        "land_use": "Government",
        "current_owner": "Tamil Nadu Water Resources Dept (Eri Puramboke)",
        "status": "Active",
        "coordinates": [
            [[77.0360, 11.0270], [77.0400, 11.0270], [77.0400, 11.0295], [77.0360, 11.0295], [77.0360, 11.0270]]
        ],
        "history": [
            {"event_type": "Public Asset Notification", "description": "Classified as Protected Waterbody / Water Channel in Master Plan.", "event_date": "2010-01-01", "source": "Gazette Notification"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-127-2",
        "survey_number": "127/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0282,
        "longitude": 77.0412,
        "recorded_area": 1.50,
        "gis_area": 1.49,
        "area_unit": "Acres",
        "land_use": "Government",
        "current_owner": "Sulur Town Panchayat (Gram Natham Common)",
        "status": "Active",
        "coordinates": [
            [[77.0400, 11.0270], [77.0425, 11.0270], [77.0425, 11.0295], [77.0400, 11.0295], [77.0400, 11.0270]]
        ],
        "history": [
            {"event_type": "Village Panchayat Common Site", "description": "Reserved for community center and public amenities.", "event_date": "2012-07-22", "source": "Rural Development Dept"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-128-1",
        "survey_number": "128/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0238,
        "longitude": 77.0327,
        "recorded_area": 6.20,
        "gis_area": 6.22,
        "area_unit": "Acres",
        "land_use": "Commercial",
        "current_owner": "TechParks India Corp",
        "status": "Active",
        "coordinates": [
            [[77.0310, 11.0225], [77.0345, 11.0225], [77.0345, 11.0250], [77.0310, 11.0250], [77.0310, 11.0225]]
        ],
        "history": [
            {"event_type": "SIPCOT / ELCOT Clearance", "description": "IT infrastructure clearance issued.", "event_date": "2023-04-14", "source": "Guidance Tamil Nadu"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-128-2",
        "survey_number": "128/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0238,
        "longitude": 77.0357,
        "recorded_area": 1.10,
        "gis_area": 1.09,
        "area_unit": "Acres",
        "land_use": "Residential",
        "current_owner": "Lakshmi Narayanan",
        "status": "Active",
        "coordinates": [
            [[77.0345, 11.0225], [77.0370, 11.0225], [77.0370, 11.0250], [77.0345, 11.0250], [77.0345, 11.0225]]
        ],
        "history": [
            {"event_type": "Housing Scheme Approval", "description": "Single family layout approved.", "event_date": "2022-01-20", "source": "Local Planning Authority"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-129-1",
        "survey_number": "129/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0238,
        "longitude": 77.0382,
        "recorded_area": 2.00,
        "gis_area": 1.98,
        "area_unit": "Acres",
        "land_use": "Residential",
        "current_owner": "V. Karthikeyan",
        "status": "Active",
        "coordinates": [
            [[77.0370, 11.0225], [77.0395, 11.0225], [77.0395, 11.0250], [77.0370, 11.0250], [77.0370, 11.0225]]
        ],
        "history": [
            {"event_type": "Ownership Transfer 1", "description": "Sold by Original Owner to G. Sundaram (Doc 1204/2019).", "event_date": "2019-06-11", "source": "Registration Dept"},
            {"event_type": "Ownership Transfer 2", "description": "Sold by G. Sundaram to V. Karthikeyan (Doc 3108/2024).", "event_date": "2024-08-25", "source": "Registration Dept"},
            {"event_type": "Patta Passbook Update", "description": "e-Patta issued in digital ledger.", "event_date": "2024-09-10", "source": "Revenue Department"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-129-2",
        "survey_number": "129/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0235,
        "longitude": 77.0410,
        "recorded_area": 1.75,
        "gis_area": 1.62,
        "area_unit": "Acres",
        "land_use": "Agricultural",
        "current_owner": "Selvi Anbarasu",
        "status": "Boundary Discrepancy",
        "coordinates": [
            [[77.0395, 11.0225], [77.0425, 11.0225], [77.0425, 11.0245], [77.0395, 11.0245], [77.0395, 11.0225]]
        ],
        "history": [
            {"event_type": "Irrigation Canal Buffer Discrepancy", "description": "PWD drainage channel alignment reduces usable plot extent from 1.75 to 1.62 Acres.", "event_date": "2025-10-30", "source": "PWD Survey Team"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-130-1",
        "survey_number": "130/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0305,
        "longitude": 77.0322,
        "recorded_area": 0.85,
        "gis_area": 0.85,
        "area_unit": "Acres",
        "land_use": "Residential",
        "current_owner": "A. Joseph",
        "status": "Active",
        "coordinates": [
            [[77.0310, 11.0295], [77.0335, 11.0295], [77.0335, 11.0315], [77.0310, 11.0315], [77.0310, 11.0295]]
        ],
        "history": [
            {"event_type": "Building Permit Approval", "description": "Residential villa plan approved.", "event_date": "2023-05-18", "source": "Panchayat Union"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-130-2",
        "survey_number": "130/2",
        "subdivision": "2",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0305,
        "longitude": 77.0352,
        "recorded_area": 3.10,
        "gis_area": 3.08,
        "area_unit": "Acres",
        "land_use": "Agricultural",
        "current_owner": "G. Natarajan",
        "status": "Active",
        "coordinates": [
            [[77.0335, 11.0295], [77.0370, 11.0295], [77.0370, 11.0315], [77.0335, 11.0315], [77.0335, 11.0295]]
        ],
        "history": [
            {"event_type": "Crop Insurance Tagging", "description": "PMFBY seasonal crop survey verified.", "event_date": "2025-07-14", "source": "Agriculture Dept"}
        ]
    },
    {
        "parcel_id": "TN-CBE-001-131-1",
        "survey_number": "131/1",
        "subdivision": "1",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village": "Demo Village",
        "latitude": 11.0305,
        "longitude": 77.0397,
        "recorded_area": 12.00,
        "gis_area": 12.00,
        "area_unit": "Acres",
        "land_use": "Government",
        "current_owner": "Tamil Nadu Forest Dept (Reserve Fringe)",
        "status": "Active",
        "coordinates": [
            [[77.0370, 11.0295], [77.0425, 11.0295], [77.0425, 11.0315], [77.0370, 11.0315], [77.0370, 11.0295]]
        ],
        "history": [
            {"event_type": "Reserve Forest Demarcation", "description": "GPS geo-tagged boundary cairns erected.", "event_date": "2014-08-01", "source": "Forest Range Officer"}
        ]
    }
]

def seed_parcels(db: Session):
    """
    Seed initial 16 demo parcels, geometries, and histories if not already present.
    """
    count = db.query(Parcel).count()
    if count >= len(SEED_PARCELS_DATA):
        return

    for item in SEED_PARCELS_DATA:
        pid = item["parcel_id"]
        existing = db.query(Parcel).filter(Parcel.parcel_id == pid).first()
        if not existing:
            parcel = Parcel(
                parcel_id=pid,
                survey_number=item["survey_number"],
                subdivision=item["subdivision"],
                district=item["district"],
                state=item["state"],
                village=item["village"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                recorded_area=item["recorded_area"],
                gis_area=item["gis_area"],
                area_unit=item["area_unit"],
                land_use=item["land_use"],
                current_owner=item["current_owner"],
                status=item["status"]
            )
            db.add(parcel)
            db.flush()

            # Create geometry
            geom_geojson = {
                "type": "Polygon",
                "coordinates": item["coordinates"]
            }
            geometry = ParcelGeometry(
                parcel_id=pid,
                geometry_type="Polygon",
                coordinates_json=json.dumps(item["coordinates"]),
                geojson=json.dumps(geom_geojson)
            )
            db.add(geometry)

            # Create histories
            for h in item.get("history", []):
                hist = ParcelHistory(
                    parcel_id=pid,
                    event_type=h["event_type"],
                    description=h["description"],
                    event_date=h["event_date"],
                    source=h.get("source", "Revenue Dept Records")
                )
                db.add(hist)

            db.commit()
            print(f"[GIS SEED] Seeded Parcel {pid} ({item['survey_number']})")
