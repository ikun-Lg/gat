import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type PrimaryColor = 'blue' | 'purple' | 'green' | 'red' | 'orange';

interface ThemeState {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      primaryColor: 'blue',
      setMode: (mode) => set({ mode }),
      setPrimaryColor: (color) => set({ primaryColor: color }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
