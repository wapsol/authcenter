'use client';

import { CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import { formatDate } from '@/lib/utils';

interface ConnectionItemProps {
  connection: {
    id: number;
    provider: string;
    status: string;
    created_at: string;
  };
  onDelete: (id: number) => void;
  onRefresh: (id: number) => void;
  isDeleting: boolean;
  isRefreshing: boolean;
}

function ConnectionItem({ connection, onDelete, onRefresh, isDeleting, isRefreshing }: ConnectionItemProps) {
  const isActive = connection.status === 'active';
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
      <div className="flex items-center space-x-3">
        {isActive ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <div>
          <div className="font-medium text-slate-100 capitalize">{connection.provider}</div>
          <div className="text-sm text-slate-400">
            Connected {formatDate(connection.created_at)}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onRefresh(connection.id)}
          disabled={isRefreshing}
          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
          title="Refresh connection"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => onDelete(connection.id)}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
          title="Remove connection"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ConnectionManager() {
  const { connections, deleteConnection, refreshConnection, isLoading } = useConnections();

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 electric-glow">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Your Connections</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-slate-700 rounded-lg"></div>
          <div className="h-16 bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Connections</h2>
      
      {connections.length === 0 ? (
        <div className="text-center py-8">
          <XCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-300">No connections yet</p>
          <p className="text-sm text-slate-400">Connect a service to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <ConnectionItem
              key={connection.id}
              connection={connection}
              onDelete={deleteConnection}
              onRefresh={refreshConnection}
              isDeleting={false}
              isRefreshing={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}