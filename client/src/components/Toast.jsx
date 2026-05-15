// === Toast Component ===
import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon className="toast-icon" />
            <span className="toast-message">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}