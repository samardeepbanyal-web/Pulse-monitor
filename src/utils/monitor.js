/**
 * Performs a health check on a single service (Live or Mock)
 * 
 * @param {Object} service - Service configuration object
 * @returns {Promise<Object>} Updated service fields { status, responseTime, lastChecked, history }
 */
export async function checkService(service) {
  const now = new Date().toISOString();
  const maxHistory = 12;

  if (service.mode === 'mock') {
    // Simulate brief network delay for mock responsiveness
    await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 200));

    // Calculate simulated latency based on current status & historical baseline
    let baseTime = service.responseTime || 50;
    if (service.status === 'degraded') {
      baseTime = Math.max(baseTime, 850);
    }

    // Jitter by ±12%
    const jitter = (Math.random() - 0.5) * 0.24 * baseTime;
    const simulatedTime = Math.max(15, Math.round(baseTime + jitter));

    // Determine status
    let status = 'operational';
    if (simulatedTime >= 800) {
      status = 'degraded';
    }

    const newHistoryPoint = {
      time: simulatedTime,
      status,
      timestamp: now,
    };

    const updatedHistory = [...(service.history || []), newHistoryPoint].slice(-maxHistory);

    return {
      status,
      responseTime: simulatedTime,
      lastChecked: now,
      history: updatedHistory,
      errorMessage: null,
    };
  }

  // --- LIVE MONITORING MODE ---
  const controller = new AbortController();
  const timeoutMs = 5000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();

  try {
    const response = await fetch(service.url, {
      method: service.method || 'GET',
      signal: controller.signal,
      headers: {
        'Accept': '*/*',
      },
      // Note: standard fetch in browser
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const expected = Number(service.expectedStatus) || 200;
    const isStatusOk = response.status === expected;

    let status = 'down';
    let errorMessage = null;

    if (isStatusOk) {
      status = duration >= 800 ? 'degraded' : 'operational';
    } else {
      status = 'down';
      errorMessage = `HTTP ${response.status} (Expected ${expected})`;
    }

    const newHistoryPoint = {
      time: duration,
      status,
      timestamp: now,
    };

    const updatedHistory = [...(service.history || []), newHistoryPoint].slice(-maxHistory);

    return {
      status,
      responseTime: duration,
      lastChecked: now,
      history: updatedHistory,
      errorMessage,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    let errorMsg = 'Connection error';
    if (err.name === 'AbortError') {
      errorMsg = 'Request timed out (5s limit)';
    } else if (err.message) {
      errorMsg = err.message.includes('Failed to fetch')
        ? 'Network / CORS Error'
        : err.message;
    }

    const newHistoryPoint = {
      time: duration > 5000 ? 5000 : duration,
      status: 'down',
      timestamp: now,
    };

    const updatedHistory = [...(service.history || []), newHistoryPoint].slice(-maxHistory);

    return {
      status: 'down',
      responseTime: duration > 5000 ? 5000 : duration,
      lastChecked: now,
      history: updatedHistory,
      errorMessage: errorMsg,
    };
  }
}

/**
 * Format relative time string (e.g., '12s ago', '2m ago', 'Just now')
 */
export function formatTimeAgo(isoString) {
  if (!isoString) return 'Never';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);

  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
