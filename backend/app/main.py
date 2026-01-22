from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .core.database import get_db, engine
from .core.config import settings
from .models import user, restaurant, sales
from .api.v1 import auth, restaurants, upload, analytics

# Create database tables
user.Base.metadata.create_all(bind=engine)
restaurant.Base.metadata.create_all(bind=engine)
sales.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant Analytics API", version="1.0.0")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(restaurants.router, prefix="/api/v1/restaurants", tags=["restaurants"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Restaurant Analytics API"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}