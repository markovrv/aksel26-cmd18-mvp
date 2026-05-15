// === Toast Store ===
import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: [],

  // Add toast
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    set(state => ({ toasts: [...state.toasts, toast] }));

    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, duration);

    return id;
  },

  // Remove toast
  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  // Convenience methods
  success: (message) => get().addToast(message, 'success'),
  error: (message) => get().addToast(message, 'error'),
  info: (message) => get().addToast(message, 'info'),
}));