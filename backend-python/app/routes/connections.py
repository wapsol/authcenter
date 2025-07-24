from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import json
from ..database import get_database
from ..auth import verify_token

router = APIRouter()

@router.get("/")
async def get_user_connections(current_user = Depends(verify_token)):
    """Get all connections for the current user"""
    db = await get_database()
    cursor = await db.execute("""
        SELECT c.*, p.display_name as provider_name 
        FROM connections c
        LEFT JOIN providers p ON c.provider_id = p.id
        WHERE c.user_id = ? AND c.status = 'active'
        ORDER BY c.created_at DESC
    """, (current_user['user_id'],))
    rows = await cursor.fetchall()
    
    connections = []
    for row in rows:
        connection = dict(row)
        # Parse JSON fields
        if connection['metadata']:
            connection['metadata'] = json.loads(connection['metadata'])
        if connection['scopes']:
            connection['scopes'] = connection['scopes'].split(',')
        connections.append(connection)
    
    return {"connections": connections}

@router.get("/{connection_id}")
async def get_connection(connection_id: int, current_user = Depends(verify_token)):
    """Get specific connection details"""
    db = await get_database()
    cursor = await db.execute("""
        SELECT c.*, p.display_name as provider_name, p.oauth_config 
        FROM connections c
        LEFT JOIN providers p ON c.provider_id = p.id
        WHERE c.id = ? AND c.user_id = ?
    """, (connection_id, current_user['user_id']))
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    connection = dict(row)
    # Parse JSON fields
    if connection['metadata']:
        connection['metadata'] = json.loads(connection['metadata'])
    if connection['scopes']:
        connection['scopes'] = connection['scopes'].split(',')
    if connection['oauth_config']:
        connection['oauth_config'] = json.loads(connection['oauth_config'])
    
    return {"connection": connection}

@router.delete("/{connection_id}")
async def delete_connection(connection_id: int, current_user = Depends(verify_token)):
    """Delete a user's connection"""
    db = await get_database()
    
    # Check if connection exists and belongs to user
    cursor = await db.execute(
        "SELECT id FROM connections WHERE id = ? AND user_id = ?",
        (connection_id, current_user['user_id'])
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Delete the connection
    await db.execute(
        "UPDATE connections SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (connection_id,)
    )
    await db.commit()
    
    return {"success": True, "message": "Connection deleted successfully"}