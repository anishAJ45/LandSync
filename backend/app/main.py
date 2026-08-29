import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.database import engine, Base, SessionLocal
from app.database.seed import seed_database
from app.api import auth, users, dashboard, parcels, applications, notifications, analytics, documents

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan event handler:
    1. Automatically creates all SQLite database tables on startup.
    2. Automatically seeds default demo users (Citizen, Officer, Admin) if not existing.
    """
    print(f"[*] Starting {settings.PROJECT_NAME} backend...")
    print(f"[*] Initializing SQLite database tables at: {settings.DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    
    # Run seed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    print(f"[*] Database initialized and demo accounts ready.")
    yield
    print(f"[*] Shutting down {settings.PROJECT_NAME} backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.TAGLINE} | Problem: {settings.PROBLEM_STATEMENT}",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
# Supporting development clients (Vite on port 5173 / port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(parcels.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System"])
def root():
    """
    Root endpoint returning project identity and metadata.
    """
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "problem_statement": settings.PROBLEM_STATEMENT,
        "phase": "PHASE 4: DOCUMENT INTELLIGENCE & AI/OCR VERIFICATION ENGINE",
        "status": "Online",
        "docs_url": "/docs",
        "version": settings.VERSION
    }

@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint for container probes and monitoring.
    """
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "timestamp": os.getenv("CURRENT_TIME", "2026-08-26T09:00:00Z")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
