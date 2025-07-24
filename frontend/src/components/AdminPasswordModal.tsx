'use client';

import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { adminApi } from '@/lib/api';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function AdminPasswordModal({ isOpen, onClose, onSuccess, title = "Admin Access Required" }: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await adminApi.verifyPassword(password);
      // Store admin session (temporary, clears on page refresh)
      sessionStorage.setItem('admin_authenticated', 'true');
      onSuccess();
      onClose();
      setPassword('');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 max-w-md w-full mx-4 electric-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter admin password"
              required
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="flex-1 px-4 py-2 gradient-bg hover:opacity-90 disabled:opacity-50 text-white rounded-md transition-all"
            >
              {isLoading ? 'Verifying...' : 'Access'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-slate-500 text-center">
          This feature requires administrator privileges
        </div>
      </div>
    </div>
  );
}