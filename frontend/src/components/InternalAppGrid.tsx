'use client';

import { useState, useEffect } from 'react';
import { Server, Database, Cpu, FileText } from 'lucide-react';
import { InternalApp } from '@/lib/api';
import { mappingApi } from '@/lib/api';

interface InternalAppCardProps {
  app: InternalApp;
  isSelected: boolean;
  onSelect: (app: InternalApp) => void;
}

function InternalAppCard({ app, isSelected, onSelect }: InternalAppCardProps) {
  const getIcon = (name: string) => {
    if (name.includes('magnetiq') || name.includes('cms')) return <FileText className="h-6 w-6 text-cyan-400" />;
    if (name.includes('email') || name.includes('mail')) return <FileText className="h-6 w-6 text-blue-400" />;
    if (name.includes('database') || name.includes('data')) return <Database className="h-6 w-6 text-green-400" />;
    if (name.includes('ai') || name.includes('processor')) return <Cpu className="h-6 w-6 text-purple-400" />;
    return <Server className="h-6 w-6 text-cyan-400" />;
  };

  return (
    <div
      onClick={() => onSelect(app)}
      className={`
        bg-slate-800 rounded-lg shadow-lg border p-6 cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 electric-glow ring-2 ring-blue-500/50' 
          : 'border-slate-700 hover:border-blue-500/50 hover:shadow-xl'
        }
      `}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 rounded-lg bg-slate-700">
          {getIcon(app.name)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{app.display_name}</h3>
          <p className="text-sm text-slate-400">{app.description}</p>
        </div>
      </div>
      
      {isSelected && (
        <div className="text-xs text-blue-400 font-medium">
          ✓ Selected for mapping
        </div>
      )}
    </div>
  );
}

interface InternalAppGridProps {
  selectedApp: InternalApp | null;
  onAppSelect: (app: InternalApp) => void;
}

export function InternalAppGrid({ selectedApp, onAppSelect }: InternalAppGridProps) {
  const [apps, setApps] = useState<InternalApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await mappingApi.getInternalApps();
        setApps(response.internal_apps || []);
      } catch (error) {
        console.error('Failed to fetch internal apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Select Internal Application</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Select Internal Application</h2>
      <p className="text-slate-300 mb-6">
        Choose which internal application should receive data from the external service.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {apps.map((app) => (
          <InternalAppCard
            key={app.id}
            app={app}
            isSelected={selectedApp?.id === app.id}
            onSelect={onAppSelect}
          />
        ))}
      </div>
      
      {apps.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No internal applications available</p>
          <p className="text-sm text-slate-500">Contact your administrator to register applications</p>
        </div>
      )}
    </div>
  );
}