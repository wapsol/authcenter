from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from ..database import get_database

router = APIRouter()

@router.get("/")
async def get_providers():
    """Get all enabled providers"""
    db = await get_database()
    cursor = await db.execute(
        "SELECT * FROM providers WHERE enabled = 1 ORDER BY display_name"
    )
    rows = await cursor.fetchall()
    
    providers = []
    for row in rows:
        provider = dict(row)
        # Parse JSON fields
        provider['oauth_config'] = json.loads(provider['oauth_config'])
        provider['scopes'] = provider['scopes'].split(',')
        providers.append(provider)
    
    return {"providers": providers}

@router.get("/{provider_id}")
async def get_provider(provider_id: int):
    """Get specific provider by ID"""
    db = await get_database()
    cursor = await db.execute(
        "SELECT * FROM providers WHERE id = ?", (provider_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    provider = dict(row)
    provider['oauth_config'] = json.loads(provider['oauth_config'])
    provider['scopes'] = provider['scopes'].split(',')
    
    return {"provider": provider}