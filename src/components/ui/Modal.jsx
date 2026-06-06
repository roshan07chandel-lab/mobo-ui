import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`w-full ${sizeClasses[size]} relative z-10 transition-all transform scale-100`}>
        <GlassCard className={`relative flex flex-col max-h-[90vh] overflow-hidden !p-0 ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-xl font-semibold text-white font-heading">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {children}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Modal;
