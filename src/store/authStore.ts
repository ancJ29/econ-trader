import { authService } from '@/services/auth';
import { dedupe } from '@an-oct/vani-kit';
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  reconnect: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        set({ isAuthenticated: true, isLoading: false });
        return true;
      }
      set({
        error: 'Invalid email or password',
        isLoading: false,
      });
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(email, password);
      if (result.success) {
        set({ isLoading: false });
        return true;
      }
      set({
        error: 'Failed to register',
        isLoading: false,
      });
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to register',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({ isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to logout',
        isLoading: false,
      });
    }
  },

  reconnect: async () => {
    set({ isLoading: true, error: null });
    dedupe.asyncDeduplicator.call('auth-store.reconnect', async () => {
      try {
        const result = await authService.reconnect();
        set({
          isAuthenticated: result.success,
          isLoading: false,
          isInitializing: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to reconnect',
          isAuthenticated: false,
          isLoading: false,
          isInitializing: false,
        });
      }
    });
  },
}));
