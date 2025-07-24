'use client';

import { User, LogOut, Settings, FileText, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  // Admin features are now publicly accessible
  const handleAdminAction = (action: 'logs' | 'register') => {
    if (action === 'logs') {
      window.location.href = '/admin/logs';
    } else if (action === 'register') {
      window.location.href = '/admin/register';
    }
  };

  return (
    <>
      <nav className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors">
                Auth Hub
              </a>
              
              {/* Admin Menu Items - Visible to all */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => handleAdminAction('register')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Register New App</span>
                </button>
                
                <button
                  onClick={() => handleAdminAction('logs')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Auth Logs</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile Admin Menu */}
              <div className="md:hidden relative group">
                <button className="p-2 text-slate-400 hover:text-slate-100 rounded-md">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-700 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <button
                    onClick={() => handleAdminAction('register')}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                  >
                    Register New App
                  </button>
                  <button
                    onClick={() => handleAdminAction('logs')}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                  >
                    Auth Logs
                  </button>
                </div>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{user?.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="text-sm text-slate-400 max-w-sm text-right hidden lg:block">
                  Authentication bridge between your SaaS accounts and Private Cloud apps.
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}