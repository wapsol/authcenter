import { google } from 'googleapis';
import axios from 'axios';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class GoogleAuthService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw createError('Failed to obtain access token', 500);
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
        scope: tokens.scope,
        token_type: 'Bearer'
      };
    } catch (error) {
      logger.error('Token exchange failed:', error);
      throw createError('Failed to exchange authorization code', 500);
    }
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const { id, email, name, picture } = response.data;
      
      if (!id || !email || !name) {
        throw createError('Incomplete user information received', 500);
      }

      return { id, email, name, picture };
    } catch (error) {
      logger.error('Failed to get user info:', error);
      throw createError('Failed to retrieve user information', 500);
    }
  }

  async refreshToken(refreshToken: string): Promise<GoogleTokens> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw createError('Failed to refresh access token', 500);
      }

      return {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || refreshToken,
        expires_in: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
        scope: credentials.scope,
        token_type: 'Bearer'
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw createError('Failed to refresh access token', 500);
    }
  }

  async revokeToken(accessToken: string): Promise<void> {
    try {
      await axios.post(`https://oauth2.googleapis.com/revoke?token=${accessToken}`);
    } catch (error) {
      logger.error('Token revocation failed:', error);
      throw createError('Failed to revoke access token', 500);
    }
  }
}