from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash
from app.database.parcel_seed import seed_parcels
from app.database.application_seed import seed_applications

DEMO_USERS = [
    {
        "full_name": "Ramesh Kumar (Citizen)",
        "email": "citizen@landsync.demo",
        "password": "Citizen@123",
        "role": "citizen"
    },
    {
        "full_name": "Vikram Rathore (Tahsildar / Land Officer)",
        "email": "officer@landsync.demo",
        "password": "Officer@123",
        "role": "officer"
    },
    {
        "full_name": "Dr. Ananya Sharma (Chief Land Records Admin)",
        "email": "admin@landsync.demo",
        "password": "Admin@123",
        "role": "admin"
    }
]

def seed_database(db: Session):
    """
    Seed initial demo users into the SQLite database if they don't already exist.
    Passwords are automatically hashed using bcrypt.
    """
    for user_data in DEMO_USERS:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            hashed_pwd = get_password_hash(user_data["password"])
            db_user = User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                password_hash=hashed_pwd,
                role=user_data["role"],
                is_active=True
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print(f"[SEED] Created demo account: {user_data['email']} ({user_data['role']})")
        else:
            print(f"[SEED] Demo account already exists: {user_data['email']}")
    
    # Seed Phase 2 Parcels
    seed_parcels(db)
    
    # Seed Phase 3 Applications, Histories, Notes, Notifications & Audit Logs
    seed_applications(db)
