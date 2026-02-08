import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarWidth: number;
  isSidebarOpen: boolean;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarWidth: 260,
      isSidebarOpen: true,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: 'layout-storage',
    }
  )
);
