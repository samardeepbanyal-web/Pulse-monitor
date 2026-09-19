import React, { useState, useEffect } from 'react';
import { X, Globe, Server, Hash, ShieldCheck } from 'lucide-react';

export default function ServiceModal({ isOpen, onClose, onSave, editingService = null }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET',
    expectedStatus: 200,
    mode: 'live',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || '',
        url: editingService.url || '',
        method: editingService.method || 'GET',
        expectedStatus: editingService.expectedStatus || 200,
        mode: editingService.mode || 'live',
      });
    } else {
      setFormData({
        name: '',
        url: '',
        method: 'GET',
        expectedStatus: 200,
        mode: 'live',
      });
    }
    setErrors({});
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Endpoint URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch (_) {
        newErrors.url = 'Please enter a valid URL (e.g. https://example.com/api)';
      }
    }

    const statusNum = Number(formData.expectedStatus);
    if (isNaN(statusNum) || statusNum < 100 || statusNum > 599) {
      newErrors.expectedStatus = 'Status code must be between 100 and 599';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      expectedStatus: Number(formData.expectedStatus) || 200,
    });
  };

  const fillExampleUrl = (url, name) => {
    setFormData((prev) => ({
      ...prev,
      url,
      name: prev.name || name,
      mode: 'live',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure health check endpoint and monitoring mode
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Service Name *
            </label>
            <input
              type="text"
              placeholder="e.g. User Authentication API"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Endpoint URL *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://example.com/health"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  errors.url ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.url && <p className="text-rose-400 text-xs mt-1">{errors.url}</p>}

            {/* Quick autofill sample links for convenience */}
            {!editingService && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>Try CORS-friendly test:</span>
                <button
                  type="button"
                  onClick={() => fillExampleUrl('https://dummyjson.com/test', 'DummyJSON API')}
                  className="text-sky-400 hover:underline"
                >
                  DummyJSON
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => fillExampleUrl('https://httpbin.org/status/200', 'HttpBin API')}
                  className="text-sky-400 hover:underline"
                >
                  HttpBin 200
                </button>
              </div>
            )}
          </div>

          {/* Method & Status Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                HTTP Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expected Status
              </label>
              <input
                type="number"
                placeholder="200"
                value={formData.expectedStatus}
                onChange={(e) => setFormData({ ...formData, expectedStatus: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  errors.expectedStatus ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.expectedStatus && (
                <p className="text-rose-400 text-xs mt-1">{errors.expectedStatus}</p>
              )}
            </div>
          </div>

          {/* Monitoring Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Monitoring Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  formData.mode === 'live'
                    ? 'bg-sky-500/10 border-sky-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="live"
                  checked={formData.mode === 'live'}
                  onChange={() => setFormData({ ...formData, mode: 'live' })}
                  className="sr-only"
                />
                <Globe className={`w-5 h-5 ${formData.mode === 'live' ? 'text-sky-400' : 'text-slate-500'}`} />
                <div>
                  <span className="block text-sm font-medium">Live HTTP</span>
                  <span className="block text-[10px] text-slate-500">Real browser fetch</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  formData.mode === 'mock'
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="mock"
                  checked={formData.mode === 'mock'}
                  onChange={() => setFormData({ ...formData, mode: 'mock' })}
                  className="sr-only"
                />
                <Server className={`w-5 h-5 ${formData.mode === 'mock' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <span className="block text-sm font-medium">Mock Mode</span>
                  <span className="block text-[10px] text-slate-500">Simulated jitter</span>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              {editingService ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
