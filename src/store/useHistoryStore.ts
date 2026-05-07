import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BmiClassKey } from '@/lib/bmi';
import { STORAGE_KEY } from '@/lib/storage';

export interface HistoryEntry {
  id: string;
  profileId: string;
  ts: number;
  weightKg: number;
  heightM: number;
  bmi: number;
  classKey: BmiClassKey;
}

interface HistoryState {
  entries: HistoryEntry[];
  add: (e: Omit<HistoryEntry, 'id' | 'ts'> & { ts?: number }) => HistoryEntry;
  remove: (id: string) => void;
  clear: (profileId?: string) => void;
  forProfile: (profileId: string) => HistoryEntry[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (e) => {
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          ts: e.ts ?? Date.now(),
          profileId: e.profileId,
          weightKg: e.weightKg,
          heightM: e.heightM,
          bmi: e.bmi,
          classKey: e.classKey
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return entry;
      },
      remove: (id) => set((s) => ({ entries: s.entries.filter((x) => x.id !== id) })),
      clear: (profileId) =>
        set((s) => ({
          entries: profileId ? s.entries.filter((x) => x.profileId !== profileId) : []
        })),
      forProfile: (profileId) =>
        get().entries.filter((x) => x.profileId === profileId).sort((a, b) => a.ts - b.ts)
    }),
    { name: `${STORAGE_KEY}:history` }
  )
);
