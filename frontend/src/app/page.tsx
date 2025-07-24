'use client';

import { MappingInterface } from '@/components/MappingInterface';
import { ConnectionManager } from '@/components/ConnectionManager';
import { Navbar } from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { Provider, providersApi } from '@/lib/api';

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await providersApi.getProviders();
        setProviders(response);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-800 rounded mb-4 max-w-md"></div>
            <div className="h-6 bg-slate-800 rounded mb-12 max-w-2xl"></div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="h-64 bg-slate-800 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4 gradient-bg bg-clip-text text-transparent">Authentication Hub</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Connect external services to your private cloud applications for secure data processing.
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MappingInterface providers={providers} />
          </div>
          <div>
            <ConnectionManager />
          </div>
        </div>
      </main>
    </div>
  );
}
