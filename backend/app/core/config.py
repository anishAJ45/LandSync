import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "LandSync"
    TAGLINE: str = "One Parcel. One Connected View. Complete Trust."
    PROBLEM_STATEMENT: str = "SIH26014 – Integrated GIS-based Digital Public Infrastructure for Land Governance"
    VERSION: str = "1.0.0 (Phase 1: Project Foundation)"
    API_V1_STR: str = "/api"
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "landsync_sih2026_super_secret_jwt_key_for_phase1_local_dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database - SQLite by default for ₹0 zero-setup local execution (easily swappable to postgresql+asyncpg / postgis in Phase 2)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./landsync.db")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
