from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
import httpx
import logging
import secrets
import urllib.parse
from ..database import get_database
from ..auth import create_access_token, verify_token
from ..routes.admin import log_audit_event

router = APIRouter()
logger = logging.getLogger(__name__)

class GoogleAuthCode(BaseModel):
    code: str
    state: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.get("/google")
async def initiate_google_auth():
    """Initiate Google OAuth flow"""
    # Generate state parameter for security
    state = secrets.token_urlsafe(32)
    
    # Mock Google OAuth URL - in production, use real Google OAuth endpoints
    auth_url = "https://accounts.google.com/o/oauth2/auth"
    
    # OAuth parameters
    params = {
        "client_id": "mock_client_id",
        "redirect_uri": "http://localhost:3000/callback",
        "scope": "email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar",
        "response_type": "code",
        "access_type": "offline",
        "state": state
    }
    
    # Build authorization URL
    full_url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    
    return {
        "auth_url": full_url,
        "state": state,
        "message": "Redirect to this URL to complete OAuth flow"
    }

@router.post("/google/callback")
async def google_oauth_callback(auth_data: GoogleAuthCode, request: Request):
    """Handle Google OAuth callback"""
    db = await get_database()
    
    try:
        # Get Google OAuth config
        cursor = await db.execute("SELECT oauth_config FROM providers WHERE name = 'google'")
        provider_row = await cursor.fetchone()
        
        if not provider_row:
            raise HTTPException(status_code=500, detail="Google provider not configured")
        
        # TODO: Exchange code for tokens with Google
        # For now, mock the response
        logger.info(f"Received OAuth code: {auth_data.code}")
        
        # Mock user data - in production, get this from Google API
        mock_user = {
            "id": "google_123456",
            "email": "user@example.com",
            "name": "Test User"
        }
        
        # Create or update user
        await db.execute("""
            INSERT OR REPLACE INTO users (email, name, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (mock_user['email'], mock_user['name']))
        await db.commit()
        
        # Get user ID
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (mock_user['email'],))
        user_row = await cursor.fetchone()
        user_id = user_row['id']
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user_id)})
        
        # Log authentication
        await log_audit_event(
            db=db,
            action="user_authenticated",
            resource=f"user:{user_id}",
            details=f"User authenticated via Google OAuth",
            request=request,
            user_id=user_id
        )
        
        return TokenResponse(access_token=access_token)
        
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@router.get("/me")
async def get_current_user(current_user = Depends(verify_token)):
    """Get current authenticated user"""
    db = await get_database()
    cursor = await db.execute(
        "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?",
        (current_user['user_id'],)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    return dict(row)

@router.post("/logout")
async def logout(request: Request, current_user = Depends(verify_token)):
    """Log out user"""
    db = await get_database()
    
    # Log logout
    await log_audit_event(
        db=db,
        action="user_logout",
        resource=f"user:{current_user['user_id']}",
        details="User logged out",
        request=request,
        user_id=int(current_user['user_id'])
    )
    
    return {"success": True, "message": "Logged out successfully"}