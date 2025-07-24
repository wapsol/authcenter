from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import logging
from datetime import datetime
from ..database import get_database
from ..auth import verify_admin_password

router = APIRouter()
logger = logging.getLogger(__name__)

class AdminAuth(BaseModel):
    password: str

class AppRegistration(BaseModel):
    name: str
    display_name: str
    description: str
    logo_url: Optional[str] = None
    api_endpoints: Dict[str, Any]
    manifest_data: Dict[str, Any]

# Admin authentication removed - features are now publicly accessible

@router.get("/logs")
async def get_audit_logs(skip: int = 0, limit: int = 100):
    """Get audit logs for admin dashboard"""
    db = await get_database()
    
    # Get logs with pagination
    cursor = await db.execute("""
        SELECT al.*, u.email as user_email 
        FROM audit_logs al 
        LEFT JOIN users u ON al.user_id = u.id 
        ORDER BY al.created_at DESC 
        LIMIT ? OFFSET ?
    """, (limit, skip))
    logs = await cursor.fetchall()
    
    # Get total count
    cursor = await db.execute("SELECT COUNT(*) as count FROM audit_logs")
    total_row = await cursor.fetchone()
    total = total_row['count']
    
    return {
        "logs": [dict(log) for log in logs],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/logs/stats")
async def get_log_stats():
    """Get log statistics for admin dashboard"""
    db = await get_database()
    
    stats = {}
    
    # Total logs
    cursor = await db.execute("SELECT COUNT(*) as count FROM audit_logs")
    row = await cursor.fetchone()
    stats['total_logs'] = row['count']
    
    # Logs by event type
    cursor = await db.execute("""
        SELECT action, COUNT(*) as count 
        FROM audit_logs 
        GROUP BY action 
        ORDER BY count DESC
    """)
    rows = await cursor.fetchall()
    stats['by_event_type'] = [dict(row) for row in rows]
    
    # Recent logs (last 24 hours)
    cursor = await db.execute("""
        SELECT COUNT(*) as count FROM audit_logs 
        WHERE created_at > datetime('now', '-1 day')
    """)
    row = await cursor.fetchone()
    stats['recent_logs_24h'] = row['count']
    
    # Recent logs (last 7 days)
    cursor = await db.execute("""
        SELECT COUNT(*) as count FROM audit_logs 
        WHERE created_at > datetime('now', '-7 days')
    """)
    row = await cursor.fetchone()
    stats['recent_logs_7d'] = row['count']
    
    return stats

@router.get("/stats")
async def get_admin_stats():
    """Get dashboard statistics"""
    db = await get_database()
    
    # Get various stats
    stats = {}
    
    # Total users
    cursor = await db.execute("SELECT COUNT(*) as count FROM users")
    row = await cursor.fetchone()
    stats['total_users'] = row['count']
    
    # Total connections
    cursor = await db.execute("SELECT COUNT(*) as count FROM connections WHERE status = 'active'")
    row = await cursor.fetchone()
    stats['active_connections'] = row['count']
    
    # Total internal apps
    cursor = await db.execute("SELECT COUNT(*) as count FROM internal_apps WHERE status = 'active'")
    row = await cursor.fetchone()
    stats['internal_apps'] = row['count']
    
    # Recent activity (last 24 hours)
    cursor = await db.execute("""
        SELECT COUNT(*) as count FROM audit_logs 
        WHERE created_at > datetime('now', '-1 day')
    """)
    row = await cursor.fetchone()
    stats['recent_activity'] = row['count']
    
    return stats

@router.post("/register-app")
async def register_app(app_data: AppRegistration, request: Request):
    """Register a new internal application"""
    db = await get_database()
    
    try:
        await db.execute("""
            INSERT INTO internal_apps (name, display_name, description, logo_url, api_endpoints, manifest_data)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            app_data.name,
            app_data.display_name,
            app_data.description,
            app_data.logo_url,
            json.dumps(app_data.api_endpoints),
            json.dumps(app_data.manifest_data)
        ))
        await db.commit()
        
        # Log the registration
        await log_audit_event(
            db=db,
            action="app_registered",
            resource=f"internal_app:{app_data.name}",
            details=f"Registered new app: {app_data.display_name}",
            request=request
        )
        
        return {"success": True, "message": f"App '{app_data.display_name}' registered successfully"}
        
    except Exception as e:
        logger.error(f"Failed to register app: {e}")
        raise HTTPException(status_code=500, detail="Failed to register application")

@router.get("/apps")
async def get_internal_apps():
    """Get all internal applications for admin management - deduplicated"""
    db = await get_database()
    cursor = await db.execute("""
        SELECT * FROM internal_apps 
        WHERE id IN (
            SELECT MIN(id) FROM internal_apps 
            GROUP BY name, display_name
        )
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
    
    return {"apps": apps}

async def log_audit_event(db, action: str, resource: str = None, details: str = None, request: Request = None, user_id: int = None):
    """Helper function to log audit events"""
    ip_address = request.client.host if request else None
    user_agent = request.headers.get("user-agent") if request else None
    
    await db.execute("""
        INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, action, resource, details, ip_address, user_agent))
    await db.commit()