from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.database import init_database
from app.routes import auth, providers, connections, api, admin, mapping

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    yield
    # Shutdown - cleanup if needed

app = FastAPI(
    title="Authentication Hub Backend",
    description="Centralized authentication hub connecting SaaS accounts to private cloud applications",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3003",  # Additional dev port
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(providers.router, prefix="/api/providers", tags=["providers"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(api.router, prefix="/api/v1", tags=["api"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(mapping.router, prefix="/api/mapping", tags=["mapping"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": "2025-07-22T08:30:00.000Z"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )