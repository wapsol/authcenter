'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, User } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await authApi.getCurrentUser();
      setUser(userData.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiateAuth = async (provider: string) => {
    try {
      const { authUrl } = await authApi.initiateAuth(provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Auth initiation failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuthCallback = (token: string) => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
    checkAuthStatus();
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    initiateAuth,
    logout,
    handleAuthCallback,
    checkAuthStatus,
  };
}