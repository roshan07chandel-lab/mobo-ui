import React from 'react';

const Badge = ({ children, status = 'received', pulsing = false, className = '' }) => {
  const normalizedStatus = status.toLowerCase();

  const styles = {
    received: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    diagnosing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    repairing: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    ready: 'bg-green-500/15 text-green-400 border-green-500/30',
    delivered: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    'low-stock': 'bg-status-rose/15 text-status-rose border-status-rose/30 pulsing-rose',
  };

  const currentStyle = styles[normalizedStatus] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        pulsing && !normalizedStatus.includes('low-stock') ? 'pulsing-' + normalizedStatus : ''
      } ${currentStyle} ${className}`}
    >
      {normalizedStatus === 'low-stock' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-status-rose animate-ping" />
      )}
      {children}
    </span>
  );
};

export default Badge;
