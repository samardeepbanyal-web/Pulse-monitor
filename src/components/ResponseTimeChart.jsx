import React, { useState } from 'react';

/**
 * Lightweight zero-dependency SVG response time line chart
 * 
 * @param {Array} history - Array of { time: number, status: string, timestamp?: string }
 * @param {string} status - Current service status ('operational' | 'degraded' | 'down')
 */
export default function ResponseTimeChart({ history = [], status = 'operational' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center text-xs text-slate-500 bg-slate-900/40 rounded-lg border border-slate-800/60">
        No latency history yet
      </div>
    );
  }

  // Chart coordinate space
  const width = 280;
  const height = 54;
  const paddingX = 8;
  const paddingTop = 8;
  const paddingBottom = 10;

  const validPoints = history.map((item) => (typeof item === 'number' ? item : item.time || 0));
  const minTime = Math.min(...validPoints);
  const maxTime = Math.max(...validPoints);
  const range = maxTime === minTime ? 10 : maxTime - minTime;

  // Calculate coordinates
  const points = validPoints.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, validPoints.length - 1)) * (width - paddingX * 2);
    // Invert Y: higher latency = higher on chart (smaller y value)
    const normalizedY = (val - minTime) / range;
    const y = paddingTop + (1 - normalizedY) * (height - paddingTop - paddingBottom);
    return { x, y, value: val, raw: history[idx] };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Area path for gradient background
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`
    : '';

  // Theme colors
  const colorMap = {
    operational: {
      stroke: '#10b981', // emerald-500
      glow: 'rgba(16, 185, 129, 0.18)',
      badge: 'text-emerald-400',
    },
    degraded: {
      stroke: '#f59e0b', // amber-500
      glow: 'rgba(245, 158, 11, 0.18)',
      badge: 'text-amber-400',
    },
    down: {
      stroke: '#f43f5e', // rose-500
      glow: 'rgba(244, 63, 94, 0.18)',
      badge: 'text-rose-400',
    },
  };

  const theme = colorMap[status] || colorMap.operational;
  const gradientId = `chart-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="relative group bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1 px-1">
        <span>Response Time Trend</span>
        <span className="font-semibold text-slate-300">
          {hoveredPoint ? (
            <span className="text-white font-medium">
              {hoveredPoint.value} ms
            </span>
          ) : (
            `avg: ${Math.round(validPoints.reduce((a, b) => a + b, 0) / validPoints.length)}ms`
          )}
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-14 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background area fill */}
          {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

          {/* Baseline grid line */}
          <line
            x1={paddingX}
            y1={height - 2}
            x2={width - paddingX}
            y2={height - 2}
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.index === idx ? 4.5 : 2.5}
                fill={hoveredPoint?.index === idx ? '#ffffff' : theme.stroke}
                stroke="#090d16"
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPoint({ ...pt, index: idx })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
        <span>Oldest</span>
        <span>Latest ({validPoints[validPoints.length - 1]}ms)</span>
      </div>
    </div>
  );
}
