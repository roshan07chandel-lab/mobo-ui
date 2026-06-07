import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  title = 'Are you sure?',
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <ShieldAlert size={32} className="text-status-rose shrink-0" />;
      case 'warning':
        return <AlertTriangle size={32} className="text-status-gold shrink-0" />;
      default:
        return <Info size={32} className="text-primary shrink-0" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className="!p-0"
    >
      <div className="space-y-5">
        <div className="flex items-start space-x-4">
          {getIcon()}
          <div className="space-y-1">
            <p className="text-slate-200 text-sm leading-relaxed font-medium">
              {message}
            </p>
            <p className="text-muted text-xs">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-4">
          <Button
            type="button"
            variant="glass"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="text-xs px-4 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
