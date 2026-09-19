import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  Radio,
  Server,
} from 'lucide-react';
import ResponseTimeChart from './ResponseTimeChart';
import { formatTimeAgo } from '../utils/monitor';

export default function ServiceCard({
  service,
  isChecking = false,
  onCheckNow,
  onEdit,
  onDelete,
}) {
  const getStatusBadge = () => {
    if (isChecking) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Checking...
        </span>
      );
    }

    switch (service.status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            Degraded
          </span>
        );
      case 'down':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Down
          </span>
        );
    }
  };

  const getLatencyColor = () => {
    if (service.status === 'down') return 'text-rose-400';
    if (service.status === 'degraded' || service.responseTime >= 800) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between backdrop-blur-sm group">
      <div>
        {/* Header: Title & Badges */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base text-white truncate group-hover:text-emerald-300 transition-colors">
                {service.name}
              </h3>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md font-semibold border ${
                  service.mode === 'live'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}
              >
                {service.mode}
              </span>
            </div>

            {/* URL & Method */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono uppercase text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                {service.method || 'GET'}
              </span>
              <a
                href={service.url}
                target="_blank"
                rel="noreferrer"
                title={service.url}
                className="truncate hover:text-slate-200 hover:underline flex items-center gap-1 max-w-[200px] sm:max-w-[260px]"
              >
                <span className="truncate">{service.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
              </a>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[10px] text-slate-500">
                Exp: {service.expectedStatus || 200}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Error message banner if down */}
        {service.status === 'down' && service.errorMessage && (
          <div className="my-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="truncate">{service.errorMessage}</span>
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-0.5">
              Response Time
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold font-mono ${getLatencyColor()}`}>
                {service.status === 'down' && !service.responseTime ? '—' : `${service.responseTime} ms`}
              </span>
              {service.responseTime >= 800 && service.status !== 'down' && (
                <span className="text-[10px] text-amber-400 font-mono">(slow)</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-0.5">
              Last Checked
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono">{formatTimeAgo(service.lastChecked)}</span>
            </div>
          </div>
        </div>

        {/* Sparkline Line Chart */}
        <div className="mb-4">
          <ResponseTimeChart history={service.history || []} status={service.status} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <button
          onClick={() => onCheckNow(service.id)}
          disabled={isChecking}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 disabled:opacity-50 transition-colors shadow-sm active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
          <span>{isChecking ? 'Checking...' : 'Check Now'}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(service)}
            title="Edit service settings"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            title="Delete service"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
