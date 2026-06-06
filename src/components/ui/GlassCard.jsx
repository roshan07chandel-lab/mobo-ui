import React from 'react';

const GlassCard = ({ children, className = '', hoverGlow = false, ...props }) => {
  return (
    <div
      className={`glass-card p-6 ${
        hoverGlow ? 'hover:shadow-glow-primary hover:border-primary/30' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
