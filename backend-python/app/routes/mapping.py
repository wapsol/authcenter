from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import logging
from datetime import datetime
from ..database import get_database
from ..routes.admin import log_audit_event

router = APIRouter()
logger = logging.getLogger(__name__)

class MappingCreate(BaseModel):
    external_service: str
    internal_app_id: int
    mapping_config: Optional[Dict[str, Any]] = None

class MappingUpdate(BaseModel):
    mapping_config: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

@router.get("/internal-apps")
async def get_internal_apps():
    """Get all active internal applications for mapping"""
    db = await get_database()
    cursor = await db.execute("""
        SELECT * FROM internal_apps 
        WHERE status = 'active' 
        ORDER BY display_name
    """)
    rows = await cursor.fetchall()
    
    apps = []
    for row in rows:
        app = dict(row)
        # Parse JSON fields
        if app['api_endpoints']:
            app['api_endpoints'] = json.loads(app['api_endpoints'])
        if app['manifest_data']:
            app['manifest_data'] = json.loads(app['manifest_data'])
        apps.append(app)
    
    return {"internal_apps": apps}

@router.get("/external-services")
async def get_external_services():
    """Get available external services for mapping"""
    # For now, hardcoded to focus on Google Workspace Mail and Calendar
    services = [
        {
            "name": "gmail",
            "display_name": "Google Workspace Mail",
            "description": "Access and sync email messages from Google Workspace",
            "provider": "google",
            "scopes": ["https://www.googleapis.com/auth/gmail.readonly"],
            "color": "bg-red-100",
            "icon_color": "text-red-400"
        },
        {
            "name": "calendar",
            "display_name": "Google Workspace Calendar", 
            "description": "Sync calendar events and schedules from Google Workspace",
            "provider": "google",
            "scopes": ["https://www.googleapis.com/auth/calendar"],
            "color": "bg-blue-100",
            "icon_color": "text-blue-400"
        }
    ]
    
    return {"external_services": services}

@router.post("/create")
async def create_mapping(mapping: MappingCreate, request: Request):
    """Create a new app-to-app mapping"""
    db = await get_database()
    
    try:
        # Check if internal app exists
        cursor = await db.execute(
            "SELECT id, display_name FROM internal_apps WHERE id = ? AND status = 'active'",
            (mapping.internal_app_id,)
        )
        app_row = await cursor.fetchone()
        
        if not app_row:
            raise HTTPException(status_code=404, detail="Internal application not found")
        
        # Create the mapping
        await db.execute("""
            INSERT INTO app_mappings (external_service, internal_app_id, mapping_config, status)
            VALUES (?, ?, ?, 'active')
        """, (
            mapping.external_service,
            mapping.internal_app_id,
            json.dumps(mapping.mapping_config) if mapping.mapping_config else None
        ))
        await db.commit()
        
        # Log the mapping creation
        await log_audit_event(
            db=db,
            action="mapping_created",
            resource=f"mapping:{mapping.external_service}->{app_row['display_name']}",
            details=f"Created mapping from {mapping.external_service} to {app_row['display_name']}",
            request=request
        )
        
        return {"success": True, "message": "Mapping created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create mapping: {e}")
        raise HTTPException(status_code=500, detail="Failed to create mapping")

@router.get("/list")
async def get_mappings(skip: int = 0, limit: int = 100):
    """Get all app mappings"""
    db = await get_database()
    cursor = await db.execute("""
        SELECT am.*, ia.display_name as app_name, ia.logo_url 
        FROM app_mappings am
        LEFT JOIN internal_apps ia ON am.internal_app_id = ia.id
        ORDER BY am.created_at DESC
        LIMIT ? OFFSET ?
    """, (limit, skip))
    rows = await cursor.fetchall()
    
    mappings = []
    for row in rows:
        mapping = dict(row)
        if mapping['mapping_config']:
            mapping['mapping_config'] = json.loads(mapping['mapping_config'])
        mappings.append(mapping)
    
    return {"mappings": mappings}

@router.put("/{mapping_id}")
async def update_mapping(mapping_id: int, mapping_update: MappingUpdate, request: Request):
    """Update an existing mapping"""
    db = await get_database()
    
    try:
        # Check if mapping exists
        cursor = await db.execute("SELECT * FROM app_mappings WHERE id = ?", (mapping_id,))
        existing = await cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Mapping not found")
        
        # Update the mapping
        updates = []
        params = []
        
        if mapping_update.mapping_config is not None:
            updates.append("mapping_config = ?")
            params.append(json.dumps(mapping_update.mapping_config))
        
        if mapping_update.status is not None:
            updates.append("status = ?")
            params.append(mapping_update.status)
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(mapping_id)
            
            await db.execute(f"""
                UPDATE app_mappings 
                SET {', '.join(updates)}
                WHERE id = ?
            """, params)
            await db.commit()
            
            # Log the update
            await log_audit_event(
                db=db,
                action="mapping_updated",
                resource=f"mapping:{mapping_id}",
                details=f"Updated mapping configuration",
                request=request
            )
        
        return {"success": True, "message": "Mapping updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update mapping: {e}")
        raise HTTPException(status_code=500, detail="Failed to update mapping")

@router.delete("/{mapping_id}")
async def delete_mapping(mapping_id: int, request: Request):
    """Delete a mapping"""
    db = await get_database()
    
    try:
        # Check if mapping exists
        cursor = await db.execute("SELECT * FROM app_mappings WHERE id = ?", (mapping_id,))
        existing = await cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Mapping not found")
        
        # Delete the mapping
        await db.execute("DELETE FROM app_mappings WHERE id = ?", (mapping_id,))
        await db.commit()
        
        # Log the deletion
        await log_audit_event(
            db=db,
            action="mapping_deleted",
            resource=f"mapping:{mapping_id}",
            details=f"Deleted app mapping",
            request=request
        )
        
        return {"success": True, "message": "Mapping deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete mapping: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete mapping")