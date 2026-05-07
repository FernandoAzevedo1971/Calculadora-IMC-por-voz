import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sex } from '@/lib/bmi';
import type { ActivityLevel } from '@/lib/tmb';
import { STORAGE_KEY } from '@/lib/storage';

export interface Profile {
  id: string;
  name: string;
  sex: Sex;
  birthDate?: string; // ISO yyyy-mm-dd
  color: string;
  avatar: string;    // emoji
  activityLevel: ActivityLevel;
}

interface ProfilesState {
  profiles: Profile[];
  activeId: string | null;
  add: (p: Omit<Profile, 'id'>) => Profile;
  update: (id: string, patch: Partial<Profile>) => void;
  remove: (id: string) => void;
  setActive: (id: string) => void;
}

const PALETTE = ['#0ea5e9', '#a855f7', '#22c55e', '#f97316', '#ef4444', '#14b8a6'];

const defaultProfile = (): Profile => ({
  id: crypto.randomUUID(),
  name: 'Eu',
  sex: 'O',
  color: PALETTE[0],
  avatar: '🙂',
  activityLevel: 'sedentary'
});

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set, get) => {
      const initial = defaultProfile();
      return {
        profiles: [initial],
        activeId: initial.id,
        add: (p) => {
          const profile: Profile = { id: crypto.randomUUID(), ...p };
          set((s) => ({ profiles: [...s.profiles, profile], activeId: profile.id }));
          return profile;
        },
        update: (id, patch) =>
          set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
        remove: (id) =>
          set((s) => {
            const profiles = s.profiles.filter((p) => p.id !== id);
            const activeId =
              s.activeId === id ? (profiles[0]?.id ?? null) : s.activeId;
            return { profiles, activeId };
          }),
        setActive: (id) => {
          if (get().profiles.some((p) => p.id === id)) set({ activeId: id });
        }
      };
    },
    { name: `${STORAGE_KEY}:profiles` }
  )
);

export function getActiveProfile(): Profile | null {
  const { profiles, activeId } = useProfilesStore.getState();
  return profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null;
}
