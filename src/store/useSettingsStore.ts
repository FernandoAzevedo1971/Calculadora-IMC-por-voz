import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEY } from '@/lib/storage';

export type ThemeMode = 'system' | 'light' | 'dark' | 'hc';

interface SettingsState {
  theme: ThemeMode;
  speakResults: boolean;
  acceptedDisclaimer: boolean;
  setTheme: (t: ThemeMode) => void;
  setSpeakResults: (v: boolean) => void;
  acceptDisclaimer: () => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      speakResults: true,
      acceptedDisclaimer: false,
      setTheme: (theme) => set({ theme }),
      setSpeakResults: (speakResults) => set({ speakResults }),
      acceptDisclaimer: () => set({ acceptedDisclaimer: true }),
      reset: () => set({ theme: 'system', speakResults: true, acceptedDisclaimer: false })
    }),
    { name: `${STORAGE_KEY}:settings` }
  )
);
