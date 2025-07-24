'use client';

import { useState } from 'react';
import { Mail, Calendar, FileText, ArrowRight, Check } from 'lucide-react';
import { InternalApp, Provider } from '@/lib/api';
import { InternalAppGrid } from './InternalAppGrid';
import { useAuth } from '@/hooks/useAuth';

interface ExternalService {
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface MappingStep {
  step: 'select-external' | 'select-internal' | 'authenticate';
}

interface MappingInterfaceProps {
  providers: Provider[];
}

export function MappingInterface({ providers }: MappingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<MappingStep['step']>('select-external');
  const [selectedExternal, setSelectedExternal] = useState<ExternalService | null>(null);
  const [selectedInternal, setSelectedInternal] = useState<InternalApp | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { initiateAuth } = useAuth();

  const externalServices: ExternalService[] = [
    {
      name: 'gmail',
      displayName: 'Google Workspace Mail',
      description: 'Access and sync email messages from Google Workspace',
      icon: <Mail className="h-6 w-6 text-red-400" />,
      color: 'bg-red-100',
    },
    {
      name: 'calendar',
      displayName: 'Google Workspace Calendar',
      description: 'Sync calendar events and schedules from Google Workspace',
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      color: 'bg-blue-100',
    },
  ];

  const handleExternalSelect = (service: ExternalService) => {
    setSelectedExternal(service);
    setCurrentStep('select-internal');
  };

  const handleInternalSelect = (app: InternalApp) => {
    setSelectedInternal(app);
    setCurrentStep('authenticate');
  };

  const handleAuthenticate = async () => {
    if (!selectedExternal || !selectedInternal) return;

    setIsAuthenticating(true);
    try {
      // Store mapping context in sessionStorage for OAuth callback
      sessionStorage.setItem('mapping_context', JSON.stringify({
        external_service: selectedExternal.name,
        internal_app_id: selectedInternal.id
      }));

      await initiateAuth('google');
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'select-internal') {
      setCurrentStep('select-external');
      setSelectedExternal(null);
    } else if (currentStep === 'authenticate') {
      setCurrentStep('select-internal');
      setSelectedInternal(null);
    }
  };

  if (currentStep === 'select-external') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Select External Service</h2>
        <p className="text-slate-300 mb-6">
          Choose the external service you want to connect to your private cloud applications.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {externalServices.map((service) => (
            <div
              key={service.name}
              onClick={() => handleExternalSelect(service)}
              className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 hover:border-blue-500/50 hover:shadow-xl transition-all cursor-pointer electric-glow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-lg bg-slate-700">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{service.displayName}</h3>
                  <p className="text-sm text-slate-400">{service.description}</p>
                </div>
              </div>
              
              <div className="text-xs text-slate-500">
                Click to continue with {service.displayName}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentStep === 'select-internal') {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              {selectedExternal?.icon}
              <span className="text-slate-100 font-medium">{selectedExternal?.displayName}</span>
              <Check className="h-4 w-4 text-green-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500" />
            <div className="text-slate-400">Select internal app</div>
          </div>
          <button
            onClick={handleBack}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Change external service
          </button>
        </div>

        <InternalAppGrid
          selectedApp={selectedInternal}
          onAppSelect={handleInternalSelect}
        />
      </div>
    );
  }

  if (currentStep === 'authenticate') {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              {selectedExternal?.icon}
              <span className="text-slate-100 font-medium">{selectedExternal?.displayName}</span>
              <Check className="h-4 w-4 text-green-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500" />
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              <div className="w-4 h-4 bg-cyan-400 rounded"></div>
              <span className="text-slate-100 font-medium">{selectedInternal?.display_name}</span>
              <Check className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <button
            onClick={handleBack}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Change internal app
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Ready to Connect</h2>
          <p className="text-slate-300 mb-6">
            You're about to connect <span className="text-blue-400 font-medium">{selectedExternal?.displayName}</span> to{' '}
            <span className="text-cyan-400 font-medium">{selectedInternal?.display_name}</span>.
          </p>
          
          <div className="bg-slate-900 rounded-lg p-4 mb-6 text-left">
            <h4 className="text-slate-200 font-medium mb-2">This will allow:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• {selectedInternal?.display_name} to access your {selectedExternal?.displayName} data</li>
              <li>• Secure data flow from {selectedExternal?.displayName} into your private cloud</li>
              <li>• Automated processing and analysis of your data</li>
            </ul>
          </div>

          <button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full max-w-md gradient-bg hover:opacity-90 disabled:opacity-50 text-white px-6 py-3 rounded-md transition-all text-lg font-medium pulse-glow"
          >
            {isAuthenticating ? (
              'Redirecting to authentication...'
            ) : (
              `Authenticate ${selectedExternal?.displayName}`
            )}
          </button>

          <p className="text-xs text-slate-500 mt-4">
            You'll be redirected to {selectedExternal?.displayName} to grant permissions
          </p>
        </div>
      </div>
    );
  }

  return null;
}