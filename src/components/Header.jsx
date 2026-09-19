import React from 'react';
import { Activity, Plus, RefreshCw, Clock } from 'lucide-react';

export default function Header({
  isCheckingAll,
  onCheckAll,
  onOpenAddModal,
  secondsUntilNextCheck,
  hasLiveServices,
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">PulseBoard</h1>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time Service Health & Latency Monitor</p>
          </div>
        </div>

        {/* Action Controls & Auto-check Countdown */}
        <div className="flex items-center gap-3">
          {/* Auto-check status indicator */}
          {hasLiveServices && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Auto-check in {secondsUntilNextCheck}s</span>
            </div>
          )}

          {/* Check All / Refresh button */}
          <button
            onClick={onCheckAll}
            disabled={isCheckingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isCheckingAll ? 'Checking All...' : 'Check All'}</span>
            <span className="sm:hidden">Check</span>
          </button>

          {/* Add Service button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Service</span>
          </button>
        </div>
      </div>
    </header>
  );
}
