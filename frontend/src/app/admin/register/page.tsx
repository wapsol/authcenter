'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Server, Globe, Save, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { adminApi, InternalApp } from '@/lib/api';
import { Navbar } from '@/components/Navbar';

interface AppFormData {
  id?: number;
  name: string;
  display_name: string;
  description: string;
  logo_url: string;
  api_endpoints: string;
  manifest_data: string;
}

export default function RegisterAppPage() {
  const [internalApps, setInternalApps] = useState<InternalApp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<InternalApp | null>(null);

  const [formData, setFormData] = useState<AppFormData>({
    name: '',
    display_name: '',
    description: '',
    logo_url: '',
    api_endpoints: '',
    manifest_data: ''
  });

  useEffect(() => {
    fetchInternalApps();
  }, []);

  const fetchInternalApps = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getInternalApps();
      setInternalApps(response.apps || response.internal_apps || []);
    } catch (error) {
      console.error('Failed to fetch internal apps:', error);
      setMessage({ type: 'error', text: 'Failed to load applications' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      logo_url: '',
      api_endpoints: '',
      manifest_data: ''
    });
    setEditingApp(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditApp = (app: InternalApp) => {
    setFormData({
      id: app.id,
      name: app.name,
      display_name: app.display_name,
      description: app.description || '',
      logo_url: app.logo_url || '',
      api_endpoints: typeof app.api_endpoints === 'string' ? app.api_endpoints : JSON.stringify(app.api_endpoints, null, 2),
      manifest_data: typeof app.manifest_data === 'string' ? app.manifest_data : JSON.stringify(app.manifest_data, null, 2)
    });
    setEditingApp(app);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validate JSON fields
      try {
        if (formData.api_endpoints) JSON.parse(formData.api_endpoints);
        if (formData.manifest_data) JSON.parse(formData.manifest_data);
      } catch (error) {
        throw new Error('Invalid JSON format in API endpoints or manifest data');
      }

      const payload = {
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        logo_url: formData.logo_url,
        api_endpoints: formData.api_endpoints ? JSON.parse(formData.api_endpoints) : {},
        manifest_data: formData.manifest_data ? JSON.parse(formData.manifest_data) : {}
      };

      const response = await adminApi.registerApp(payload);
      
      setMessage({ type: 'success', text: response.message });
      resetForm();
      fetchInternalApps(); // Refresh the list
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to register application' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AppFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="mb-6">
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Applications</span>
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-slate-100">
                {editingApp ? 'Edit Application' : 'Register New Application'}
              </h1>
            </div>
            <p className="text-slate-300">
              {editingApp ? 'Update the details of the existing application.' : 'Add a new internal application to the Authentication Hub using the PCARP protocol.'}
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-900/50 border-green-500 text-green-200' 
                : 'bg-red-900/50 border-red-500 text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-blue-400 mr-2" />
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Application Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., magnetiq"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Magnetiq CMS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the application"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={formData.logo_url}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/logos/app-logo.svg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Technical Configuration */}
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                  <Server className="h-5 w-5 text-green-400 mr-2" />
                  Technical Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      API Endpoints (JSON)
                    </label>
                    <textarea
                      value={formData.api_endpoints}
                      onChange={(e) => handleInputChange('api_endpoints', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder='{"webhook": "https://example.com/webhook", "health": "https://example.com/health"}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      PCARP Manifest Data (JSON)
                    </label>
                    <textarea
                      value={formData.manifest_data}
                      onChange={(e) => handleInputChange('manifest_data', e.target.value)}
                      rows={10}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder='{"pcarp_version": "1.0", "app": {...}, "authentication": {...}}'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Full Width */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-slate-400 hover:text-slate-300 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-md transition-colors text-lg"
                >
                  <Save className="h-5 w-5" />
                  <span>{isSubmitting ? 'Saving...' : (editingApp ? 'Update Application' : 'Register Application')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-100">Application Management</h1>
          </div>
          <p className="text-slate-300">
            Manage internal applications registered with the Authentication Hub.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-900/50 border-green-500 text-green-200' 
              : 'bg-red-900/50 border-red-500 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Existing Applications */}
            {internalApps.map((app) => (
              <div
                key={app.id}
                onClick={() => handleEditApp(app)}
                className="bg-slate-800 rounded-lg p-6 cursor-pointer transition-all border border-slate-700 hover:border-blue-500/50 hover:shadow-xl hover:bg-slate-750"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-lg bg-slate-700">
                    <FileText className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100">{app.display_name}</h3>
                    <p className="text-sm text-slate-400">{app.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-400 font-medium">Click to edit</span>
                  <Edit className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            ))}

            {/* Add New Application Button */}
            <div
              onClick={handleAddNew}
              className="bg-slate-800 rounded-lg p-6 cursor-pointer transition-all border-2 border-dashed border-slate-600 hover:border-blue-500 hover:bg-slate-750 flex flex-col items-center justify-center text-center min-h-[160px]"
            >
              <div className="p-4 rounded-full bg-blue-500/20 mb-4">
                <Plus className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Add New Application</h3>
              <p className="text-sm text-slate-500">Register a new internal application</p>
            </div>
          </div>
        )}

        {internalApps.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Server className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No applications registered yet</p>
            <p className="text-sm text-slate-500">Click the + button to add your first application</p>
          </div>
        )}
      </div>
    </div>
  );
}