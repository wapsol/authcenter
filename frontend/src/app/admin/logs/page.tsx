'use client';

import { useState, useEffect } from 'react';
import { Shield, Filter, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthEvent, adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<AuthEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    event_type: '',
    limit: 50
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAuthLogs(filters);
      setLogs(response.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getLogStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getEventIcon = (eventType: string, success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'admin_login_success':
      case 'admin_login_failed':
        return 'text-purple-400';
      case 'mapping_created':
      case 'mapping_deleted':
        return 'text-blue-400';
      case 'internal_app_created':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-100">Authentication Logs</h1>
          </div>
          <p className="text-slate-300">
            Monitor all authentication events and system activities in real-time.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.total_events}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Successful</p>
                  <p className="text-2xl font-bold text-green-400">{stats.success_count}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{stats.failure_count}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Recent (24h)</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.recent_events}</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </h2>
            <button
              onClick={fetchLogs}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Event Type
              </label>
              <select
                value={filters.event_type}
                onChange={(e) => setFilters(prev => ({ ...prev, event_type: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                <option value="admin_login_success">Admin Login Success</option>
                <option value="admin_login_failed">Admin Login Failed</option>
                <option value="mapping_created">Mapping Created</option>
                <option value="mapping_deleted">Mapping Deleted</option>
                <option value="internal_app_created">Internal App Created</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="25">25 entries</option>
                <option value="50">50 entries</option>
                <option value="100">100 entries</option>
                <option value="500">500 entries</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100">Recent Events</h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEventIcon(log.event_type, log.success)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getEventTypeColor(log.event_type)}`}>
                          {log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {log.user_identifier || 'System'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                        {log.error_message || log.external_app || log.internal_app || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {logs.length === 0 && !isLoading && (
            <div className="p-12 text-center">
              <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No authentication events found</p>
              <p className="text-sm text-slate-500">Events will appear here as users interact with the system</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}