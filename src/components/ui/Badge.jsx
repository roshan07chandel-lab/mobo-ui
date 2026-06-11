import React from 'react';

const Badge = ({ children, status = 'received', pulsing = false, className = '' }) => {
  const normalizedStatus = status.toLowerCase();

  const styles = {
    received: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    diagnosing: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    repairing: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    ready: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    delivered: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20',
    cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
    'low-stock': 'bg-status-rose/10 text-status-rose border-status-rose/20 pulsing-rose',
  };

  const currentStyle = styles[normalizedStatus] || 'bg-zinc-100 text-zinc-700 border-zinc-200';

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
