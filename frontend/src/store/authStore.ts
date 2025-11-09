// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse, User } from '../types';

// 1. DEFINE THE STORE'S SHAPE
export type AuthState = {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
};

// 2. CREATE THE STORE
export const useAuthStore = create<AuthState>()(
  // 3. USE THE 'PERSIST' MIDDLEWARE
  persist(
    (set) => ({
      // --- STATE ---
      user: null,
      token: null,
      isAuth: false,

      // --- ACTIONS ---
      login: (data) => {
        // This is the data we get from our backend API
        const user = {
          _id: data._id,
          name: data.name,
          email: data.email,
          department: data.department || 'Not Specified', // Handle optional department
        };

        // Set the state
        set({ user, token: data.token, isAuth: true });
      },

      logout: () => {
        // Clear the state
        set({ user: null, token: null, isAuth: false });
      },
    }),
    {
      // 4. CONFIGURE PERSISTENCE
      name: 'auth-storage', // The key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);
