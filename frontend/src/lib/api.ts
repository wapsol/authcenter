import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Connection {
  id: number;
  provider: string;
  status: string;
  created_at: string;
}

export interface InternalApp {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  status: string;
}

export interface AppMapping {
  id: number;
  external_provider_id: number;
  internal_app_id: number;
  connection_id: number;
  external_provider_name?: string;
  internal_app_name?: string;
  created_at: string;
}

export interface AuthEvent {
  id: number;
  event_type: string;
  external_app?: string;
  internal_app?: string;
  user_identifier?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface Provider {
  id: number;
  name: string;
  display_name: string;
  scopes: string[];
  enabled: boolean;
}

export const authApi = {
  initiateAuth: async (provider: string) => {
    const response = await api.get(`/api/auth/${provider}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  },
};

export const providersApi = {
  getProviders: async () => {
    const response = await api.get('/api/providers/');
    return response.data.providers;
  },
};

export const connectionsApi = {
  getConnections: async () => {
    const response = await api.get('/api/connections');
    return response.data.connections;
  },

  deleteConnection: async (id: number) => {
    const response = await api.delete(`/api/connections/${id}`);
    return response.data;
  },

  refreshConnection: async (id: number) => {
    const response = await api.post(`/api/connections/${id}/refresh`);
    return response.data;
  },
};

export const dataApi = {
  fetchData: async (provider: string, service: string) => {
    const response = await api.get(`/api/v1/data/${provider}/${service}`);
    return response.data;
  },

  syncData: async (provider: string, service: string, data: any) => {
    const response = await api.post(`/api/v1/data/${provider}/${service}`, data);
    return response.data;
  },
};

export const adminApi = {
  verifyPassword: async (password: string) => {
    const response = await api.post('/api/admin/verify', { password });
    return response.data;
  },

  getAuthLogs: async (filters?: { limit?: number; offset?: number; event_type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.event_type) params.append('event_type', filters.event_type);
    
    const response = await api.get(`/api/admin/logs?${params}`);
    return response.data;
  },

  getLogStats: async () => {
    const response = await api.get('/api/admin/logs/stats');
    return response.data;
  },

  getInternalApps: async () => {
    const response = await api.get('/api/admin/apps');
    return response.data;
  },

  createInternalApp: async (appData: {
    name: string;
    display_name: string;
    description?: string;
    logo_url?: string;
    api_endpoints?: string;
    manifest_data?: string;
  }) => {
    const response = await api.post('/api/admin/apps', appData);
    return response.data;
  },
};

export const mappingApi = {
  getInternalApps: async () => {
    const response = await api.get('/api/mapping/internal-apps');
    return response.data;
  },

  getMappings: async () => {
    const response = await api.get('/api/mapping/mappings');
    return response.data;
  },

  createMapping: async (mapping: {
    external_provider_id: number;
    internal_app_id: number;
    connection_id: number;
  }) => {
    const response = await api.post('/api/mapping/mappings', mapping);
    return response.data;
  },

  deleteMapping: async (id: number) => {
    const response = await api.delete(`/api/mapping/mappings/${id}`);
    return response.data;
  },
};