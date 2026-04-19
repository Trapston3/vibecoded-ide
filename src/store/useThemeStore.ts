import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  set: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: (() => {
    try {
      const stored = localStorage.getItem('vibecoded-theme');
      if (stored !== null) return stored === 'dark';
    } catch {}
    return true; // default to dark mode
  })(),

  toggle: () => {
    set((state) => {
      const next = !state.isDark;
      try { localStorage.setItem('vibecoded-theme', next ? 'dark' : 'light'); } catch {}
      return { isDark: next };
    });
  },

  set: (dark: boolean) => {
    try { localStorage.setItem('vibecoded-theme', dark ? 'dark' : 'light'); } catch {}
    set({ isDark: dark });
  },
}));
