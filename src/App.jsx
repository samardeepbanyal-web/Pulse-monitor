import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ServiceCard from './components/ServiceCard';
import ServiceModal from './components/ServiceModal';
import { INITIAL_SERVICES } from './constants/initialServices';
import { checkService } from './utils/monitor';
import { AlertCircle, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'pulseboard_services_v1';
const AUTO_CHECK_INTERVAL_SEC = 60;

export default function App() {
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved services from localStorage:', e);
    }
    return INITIAL_SERVICES;
  });

  const [checkingIds, setCheckingIds] = useState(new Set());
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [secondsUntilNextCheck, setSecondsUntilNextCheck] = useState(AUTO_CHECK_INTERVAL_SEC);

  // Keep a ref to services for timer callback to prevent stale closures
  const servicesRef = useRef(services);
  servicesRef.current = services;

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.error('Error saving services to localStorage:', e);
    }
  }, [services]);

  // Execute check for a specific service
  const handleCheckService = useCallback(async (serviceId) => {
    const targetService = servicesRef.current.find((s) => s.id === serviceId);
    if (!targetService) return;

    setCheckingIds((prev) => new Set(prev).add(serviceId));

    try {
      const update = await checkService(targetService);
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, ...update } : s))
      );
    } catch (err) {
      console.error(`Check failed for ${targetService.name}:`, err);
    } finally {
      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    }
  }, []);

  // Execute check for all services
  const handleCheckAll = useCallback(async () => {
    if (isCheckingAll) return;
    setIsCheckingAll(true);

    const currentServices = servicesRef.current;
    const allIds = new Set(currentServices.map((s) => s.id));
    setCheckingIds(allIds);

    try {
      const checkPromises = currentServices.map(async (service) => {
        try {
          const update = await checkService(service);
          return { id: service.id, update };
        } catch (err) {
          return { id: service.id, update: { status: 'down', errorMessage: 'Check error' } };
        }
      });

      const results = await Promise.all(checkPromises);

      setServices((prev) =>
        prev.map((s) => {
          const res = results.find((r) => r.id === s.id);
          return res ? { ...s, ...res.update } : s;
        })
      );
    } finally {
      setCheckingIds(new Set());
      setIsCheckingAll(false);
      setSecondsUntilNextCheck(AUTO_CHECK_INTERVAL_SEC);
    }
  }, [isCheckingAll]);

  // Periodic 60-second auto-check for live services
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilNextCheck((prev) => {
        if (prev <= 1) {
          // Trigger auto-check for live services
          const liveServices = servicesRef.current.filter((s) => s.mode === 'live');
          if (liveServices.length > 0) {
            liveServices.forEach((service) => {
              handleCheckService(service.id);
            });
          }
          return AUTO_CHECK_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleCheckService]);

  // Save service (Add or Edit)
  const handleSaveService = (serviceData) => {
    if (editingService) {
      // Edit existing
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? { ...s, ...serviceData } : s))
      );
    } else {
      // Add new
      const newService = {
        id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...serviceData,
        status: serviceData.mode === 'mock' ? 'operational' : 'operational',
        responseTime: serviceData.mode === 'mock' ? 45 : null,
        lastChecked: null,
        history: serviceData.mode === 'mock' ? [{ time: 45, status: 'operational' }] : [],
      };

      setServices((prev) => [newService, ...prev]);

      // Automatically run a check if it's a live service
      if (newService.mode === 'live') {
        setTimeout(() => handleCheckService(newService.id), 100);
      }
    }

    setModalOpen(false);
    setEditingService(null);
  };

  // Delete service
  const handleDeleteService = (serviceId) => {
    if (confirm('Are you sure you want to remove this service from monitoring?')) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    }
  };

  // Reset to initial mock services
  const handleResetDefaults = () => {
    if (confirm('Reset all services to the default mock list?')) {
      setServices(INITIAL_SERVICES);
    }
  };

  const hasLiveServices = services.some((s) => s.mode === 'live');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation & Header */}
      <Header
        isCheckingAll={isCheckingAll}
        onCheckAll={handleCheckAll}
        onOpenAddModal={() => {
          setEditingService(null);
          setModalOpen(true);
        }}
        secondsUntilNextCheck={secondsUntilNextCheck}
        hasLiveServices={hasLiveServices}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important CORS Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">Notice: </span>
            Live checks may fail for endpoints that block browser CORS requests.
            For live testing in browsers, use endpoints configured with{' '}
            <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px] text-amber-100">
              Access-Control-Allow-Origin: *
            </code>{' '}
            (such as public APIs like HttpBin, DummyJSON, or your own CORS-enabled services).
          </div>
        </div>

        {/* High-level Summary Metrics */}
        <SummaryCards services={services} />

        {/* Services Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white tracking-tight">Monitored Endpoints</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {services.length}
            </span>
          </div>

          <button
            onClick={handleResetDefaults}
            title="Reset to default mock services"
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>

        {/* Service Cards Grid */}
        {services.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
            <p className="text-slate-400 mb-4">No services are currently being monitored.</p>
            <button
              onClick={() => {
                setEditingService(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isChecking={checkingIds.has(service.id)}
                onCheckNow={handleCheckService}
                onEdit={(srv) => {
                  setEditingService(srv);
                  setModalOpen(true);
                }}
                onDelete={handleDeleteService}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>PulseBoard • Lightweight React + Vite Monitoring Dashboard</p>
      </footer>

      {/* Add / Edit Service Modal */}
      <ServiceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        editingService={editingService}
      />
    </div>
  );
}
