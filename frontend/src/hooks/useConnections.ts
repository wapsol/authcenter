'use client';

import { useState, useEffect } from 'react';
import { connectionsApi, Connection } from '@/lib/api';

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const connectionsData = await connectionsApi.getConnections();
      setConnections(connectionsData.map((conn: any) => ({
        id: conn.id,
        provider: conn.provider_name,
        status: conn.status,
        created_at: conn.created_at,
      })));
      setError(null);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      setError('Failed to load connections');
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConnection = async (id: number) => {
    try {
      await connectionsApi.deleteConnection(id);
      setConnections(prev => prev.filter(conn => conn.id !== id));
    } catch (error) {
      console.error('Failed to delete connection:', error);
      throw error;
    }
  };

  const refreshConnection = async (id: number) => {
    try {
      await connectionsApi.refreshConnection(id);
      await fetchConnections();
    } catch (error) {
      console.error('Failed to refresh connection:', error);
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchConnections();
    } else {
      setIsLoading(false);
    }
  }, []);

  return {
    connections,
    isLoading,
    error,
    deleteConnection,
    refreshConnection,
    refetch: fetchConnections,
  };
}