from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api import auth, users, dashboard, data_upload, financial_analysis, scenarios, notifications, settings
from app.database import engine, Base
from app.config import settings as app_settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CashVista API",
    description="API for CashVista - Positive Cash Flow Management System",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(data_upload.router, prefix="/api/data", tags=["Data Upload"])
app.include_router(financial_analysis.router, prefix="/api/analysis", tags=["Financial Analysis"])
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["Scenario Planning"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Health check endpoint to verify the API is running
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
