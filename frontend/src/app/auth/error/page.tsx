'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorMessage = searchParams.get('message') || 'An unknown error occurred during authentication';
    setError(errorMessage);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-8 max-w-md w-full mx-4 electric-glow">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-100 mb-2">Authentication Failed</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 gradient-bg hover:opacity-90 text-white px-4 py-2 rounded-md transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}