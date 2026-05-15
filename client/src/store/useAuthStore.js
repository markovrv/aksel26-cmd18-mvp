// === Auth Store ===
import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const data = await api.get('/auth/me');
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ user: null, isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ error: null });
    try {
      const data = await api.post('/auth/login', { email, password });
      set({ user: data.user });
      return data.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Register
  register: async (email, password, name, role = 'user') => {
    set({ error: null });
    try {
      const data = await api.post('/auth/register', { email, password, name, role });
      set({ user: data.user });
      return data.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null });
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      await api.put('/profile', profileData);
      const { user } = get();
      set({ user: { ...user, ...profileData } });
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));