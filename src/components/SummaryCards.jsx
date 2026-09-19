import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export default function SummaryCards({ services = [] }) {
  const total = services.length;
  const operational = services.filter((s) => s.status === 'operational').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const down = services.filter((s) => s.status === 'down').length;
  const degradedOrDown = degraded + down;

  const liveCount = services.filter((s) => s.mode === 'live').length;
  const mockCount = services.filter((s) => s.mode === 'mock').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Services */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Total Services</span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-white tracking-tight">{total}</span>
          <span className="text-xs text-slate-500">monitored</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>{liveCount} Live</span>
          </span>
          <span className="text-slate-500">•</span>
          <span>{mockCount} Mock</span>
        </div>
      </div>

      {/* Operational */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/30 transition-colors backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Operational</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">{operational}</span>
          <span className="text-xs text-slate-500">
            {total > 0 ? `${Math.round((operational / total) * 100)}% uptime` : 'No services'}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center text-xs text-emerald-400/90 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-2" />
          Healthy and fast response
        </div>
      </div>

      {/* Degraded / Down */}
      <div className={`bg-slate-900/80 border rounded-2xl p-5 shadow-sm transition-colors backdrop-blur-sm ${
        degradedOrDown > 0 ? 'border-amber-500/30 hover:border-amber-500/50' : 'border-slate-800 hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Degraded / Down</span>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
            degradedOrDown > 0
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold font-mono tracking-tight ${
            degradedOrDown > 0 ? (down > 0 ? 'text-rose-400' : 'text-amber-400') : 'text-slate-300'
          }`}>
            {degradedOrDown}
          </span>
          <span className="text-xs text-slate-500">attention required</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className={degraded > 0 ? 'text-amber-400 font-medium' : 'text-slate-500'}>
            {degraded} Degraded (slow)
          </span>
          <span className="text-slate-500">•</span>
          <span className={down > 0 ? 'text-rose-400 font-medium' : 'text-slate-500'}>
            {down} Down
          </span>
        </div>
      </div>
    </div>
  );
}
