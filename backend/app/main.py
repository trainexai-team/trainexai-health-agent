from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.database import init_db
from app.routes import profile, checkin, decision, demo, report

app = FastAPI(
    title="TrainexAI Health Agent API",
    description="AI-powered Health Decision Engine built for HackIndia 2026",
    version="1.0.0",
)

# CORS
origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(demo.router, tags=["System & Demo"])
app.include_router(profile.router, tags=["Profile"])
app.include_router(checkin.router, tags=["Check-in"])
app.include_router(decision.router, tags=["Decisions"])
app.include_router(report.router, tags=["Reports"])


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    try:
        init_db()
        print("✅ Database tables initialized")
    except Exception as e:
        print(f"⚠️ Database initialization skipped: {e}")
        print("   The app will still run. Set DATABASE_URL in .env to connect to Supabase.")


@app.get("/")
def root():
    return {
        "message": "TrainexAI Health Agent API",
        "docs": "/docs",
        "health": "/health",
    }
