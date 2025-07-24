'use client';

import { Mail, Calendar, FileText, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ServiceCardProps {
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onConnect: () => void;
  isConnecting: boolean;
}

function ServiceCard({ name, displayName, description, icon, color, onConnect, isConnecting }: ServiceCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 hover:shadow-xl hover:border-blue-500/50 transition-all electric-glow">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{displayName}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full flex items-center justify-center space-x-2 gradient-bg hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-all pulse-glow"
      >
        <ExternalLink className="h-4 w-4" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Account'}</span>
      </button>
    </div>
  );
}

export function ServiceGrid() {
  const [connectingService, setConnectingService] = useState<string | null>(null);
  const { initiateAuth } = useAuth();

  const handleConnect = async (provider: string) => {
    setConnectingService(provider);
    try {
      await initiateAuth(provider);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingService(null);
    }
  };

  const services = [
    {
      name: 'gmail',
      displayName: 'Gmail',
      description: 'Access and sync your email messages',
      icon: <Mail className="h-6 w-6 text-red-600" />,
      color: 'bg-red-100',
    },
    {
      name: 'calendar',
      displayName: 'Google Calendar',
      description: 'Sync calendar events and schedules',
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-100',
    },
    {
      name: 'docs',
      displayName: 'Google Docs',
      description: 'Access and process your documents',
      icon: <FileText className="h-6 w-6 text-green-600" />,
      color: 'bg-green-100',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Available Services</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.name}
            {...service}
            onConnect={() => handleConnect('google')}
            isConnecting={connectingService === 'google'}
          />
        ))}
      </div>
    </div>
  );
}