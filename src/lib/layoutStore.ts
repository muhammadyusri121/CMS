import { create } from 'zustand';

interface LayoutState {
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    toggleSidebar: () => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
