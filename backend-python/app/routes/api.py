from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import json
import httpx
import logging
from ..database import get_database
from ..auth import verify_token

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/data/{provider}/{service}")
async def fetch_data(provider: str, service: str, current_user = Depends(verify_token)):
    """Fetch data from external provider service"""
    db = await get_database()
    
    try:
        # Get user's connection for this provider
        cursor = await db.execute("""
            SELECT c.* FROM connections c
            LEFT JOIN providers p ON c.provider_id = p.id
            WHERE c.user_id = ? AND p.name = ? AND c.status = 'active'
            LIMIT 1
        """, (current_user['user_id'], provider))
        connection = await cursor.fetchone()
        
        if not connection:
            raise HTTPException(status_code=404, detail=f"No active connection found for {provider}")
        
        # Mock data response based on service type
        if provider == "google":
            if service == "gmail":
                mock_data = {
                    "messages": [
                        {"id": "1", "subject": "Welcome to Auth Hub", "sender": "admin@company.com", "date": "2025-07-22"},
                        {"id": "2", "subject": "Integration Complete", "sender": "noreply@google.com", "date": "2025-07-22"}
                    ],
                    "total": 2
                }
            elif service == "calendar":
                mock_data = {
                    "events": [
                        {"id": "1", "title": "Team Meeting", "start": "2025-07-22T10:00:00Z", "end": "2025-07-22T11:00:00Z"},
                        {"id": "2", "title": "Project Review", "start": "2025-07-22T14:00:00Z", "end": "2025-07-22T15:00:00Z"}
                    ],
                    "total": 2
                }
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported service: {service}")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        return {
            "success": True,
            "provider": provider,
            "service": service,
            "data": mock_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Data fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch data")

@router.post("/data/{provider}/{service}")
async def sync_data(provider: str, service: str, sync_config: Dict[str, Any], current_user = Depends(verify_token)):
    """Sync data to internal applications"""
    db = await get_database()
    
    try:
        # Get user's connection for this provider
        cursor = await db.execute("""
            SELECT c.* FROM connections c
            LEFT JOIN providers p ON c.provider_id = p.id
            WHERE c.user_id = ? AND p.name = ? AND c.status = 'active'
            LIMIT 1
        """, (current_user['user_id'], provider))
        connection = await cursor.fetchone()
        
        if not connection:
            raise HTTPException(status_code=404, detail=f"No active connection found for {provider}")
        
        # Mock sync operation
        logger.info(f"Syncing {provider}/{service} data with config: {sync_config}")
        
        return {
            "success": True,
            "provider": provider,
            "service": service,
            "synced_records": 5,
            "sync_timestamp": "2025-07-22T08:30:00Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Data sync error: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync data")