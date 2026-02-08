import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      setAuth: (token, user) => {
        set({ isAuthenticated: true, token, user });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ isAuthenticated: false, user: null, token: null });
        localStorage.removeItem('token');
      },

      loadFromStorage: () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
